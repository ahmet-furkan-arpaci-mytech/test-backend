import type { Request, Response } from "express";
import { inject, injectable } from "inversify";

import { ResponseBuilder } from "../response/response-builder.js";
import { ListSourcesUseCase } from "../../application/use-cases/source/list-sources.use-case.js";
import { ListSourcesByCategoryUseCase } from "../../application/use-cases/source/list-sources-by-category.use-case.js";
import { ListFollowedSourcesUseCase } from "../../application/use-cases/user-source-follow/list-followed-sources.use-case.js";
import { FollowSourceUseCase } from "../../application/use-cases/user-source-follow/follow-source.use-case.js";
import {
  FollowStateUpdate,
  SyncFollowedSourcesUseCase,
} from "../../application/use-cases/user-source-follow/sync-followed-sources.use-case.js";
import { UnfollowSourceUseCase } from "../../application/use-cases/user-source-follow/unfollow-source.use-case.js";
import { DI_TYPES } from "../../main/container/ioc.types.js";

type AuthenticatedRequest = Request & { user?: Record<string, any> };

@injectable()
export class UserSourceFollowController {
  constructor(
    @inject(DI_TYPES.ListSourcesUseCase)
    private readonly listSourcesUseCase: ListSourcesUseCase,
    @inject(DI_TYPES.ListSourcesByCategoryUseCase)
    private readonly listSourcesByCategoryUseCase: ListSourcesByCategoryUseCase,
    @inject(DI_TYPES.ListFollowedSourcesUseCase)
    private readonly listFollowedSourcesUseCase: ListFollowedSourcesUseCase,
    @inject(DI_TYPES.FollowSourceUseCase)
    private readonly followSourceUseCase: FollowSourceUseCase,
    @inject(DI_TYPES.UnfollowSourceUseCase)
    private readonly unfollowSourceUseCase: UnfollowSourceUseCase,
    @inject(DI_TYPES.SyncFollowedSourcesUseCase)
    private readonly syncFollowedSourcesUseCase: SyncFollowedSourcesUseCase
  ) {}

  private extractUserId(req: AuthenticatedRequest) {
    return req.user?.sub ?? req.user?.id ?? req.user?.userId;
  }

  /**
   * @openapi
   * /api/v1/sources:
   *   get:
   *     tags:
   *       - Sources
   *     summary: List all available sources
   *     responses:
   *       200:
   *         description: Sources retrieved
   *         content:
   *           application/json:
   *             schema:
   *               $ref: "#/components/schemas/SourcesResponse"
   */
  async getAllSources(req: AuthenticatedRequest, res: Response) {
    const userId = this.extractUserId(req);
    const [sources, followedSources] = await Promise.all([
      this.listSourcesUseCase.execute(),
      userId ? this.listFollowedSourcesUseCase.execute(userId) : Promise.resolve([]),
    ]);
    const followedIds = new Set(followedSources.map((source) => source.id));
    const enriched = sources.map((source) => ({
      ...source,
      isFollowed: followedIds.has(source.id),
    }));
    return ResponseBuilder.ok(res, { sources: enriched }, "Sources retrieved");
  }

  /**
   * @openapi
   * /api/v1/sources/by-category/{categoryId}:
   *   get:
   *     tags:
   *       - Sources
   *     summary: List sources by source category
   *     parameters:
   *       - in: path
   *         name: categoryId
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Sources retrieved
   *         content:
   *           application/json:
   *             schema:
   *               $ref: "#/components/schemas/SourcesResponse"
   *       400:
   *         description: Validation error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: "#/components/schemas/ErrorResponse"
   */
  async getSourcesByCategory(req: AuthenticatedRequest, res: Response) {
    const { categoryId } = req.params;
    if (!categoryId) {
      return ResponseBuilder.badRequest(res, "categoryId is required");
    }

    const userId = this.extractUserId(req);
    const [sources, followedSources] = await Promise.all([
      this.listSourcesByCategoryUseCase.execute(categoryId),
      userId ? this.listFollowedSourcesUseCase.execute(userId) : Promise.resolve([]),
    ]);

    const followedIds = new Set(followedSources.map((source) => source.id));
    const enriched = sources.map((source) => ({
      ...source,
      isFollowed: followedIds.has(source.id),
    }));

    return ResponseBuilder.ok(res, { sources: enriched }, "Sources retrieved");
  }

  /**
   * @openapi
   * /api/v1/sources/search:
   *   get:
   *     tags:
   *       - Sources
   *     summary: Search sources by name
   *     security:
   *       - BearerAuth: []
   *       - ApiKeyAuth: []
   *     parameters:
   *       - in: query
   *         name: search
   *         schema:
   *           type: string
   *         description: Optional term to filter sources by name
   *     responses:
   *       200:
   *         description: Sources retrieved
   *         content:
   *           application/json:
   *             schema:
   *               $ref: "#/components/schemas/SourcesResponse"
   *       401:
   *         description: Authentication required
   *         content:
   *           application/json:
   *             schema:
   *               $ref: "#/components/schemas/ErrorResponse"
   */
  async searchSources(req: AuthenticatedRequest, res: Response) {
    const userId = this.extractUserId(req);
    if (!userId) {
      return ResponseBuilder.unauthorized(res, "User context required");
    }

    const search =
      typeof req.query.search === "string" ? req.query.search : undefined;
    const [sources, followedSources] = await Promise.all([
      this.listSourcesUseCase.execute(search),
      this.listFollowedSourcesUseCase.execute(userId),
    ]);
    const followedIds = new Set(followedSources.map((source) => source.id));
    const enriched = sources.map((source) => ({
      ...source,
      isFollowed: followedIds.has(source.id),
    }));
    return ResponseBuilder.ok(res, { sources: enriched }, "Sources retrieved");
  }

  /**
   * @openapi
   * /api/v1/sources/followed:
   *   get:
   *     tags:
   *       - Sources
   *     summary: Get followed sources for the authenticated user
 *     responses:
 *       200:
 *         description: List of followed sources
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/FollowedSourcesResponse"
   *               example:
   *                 sourceIds: ["source-1", "source-2"]
   *       401:
   *         description: Authentication required
   *         content:
   *           application/json:
   *             schema:
   *               $ref: "#/components/schemas/ErrorResponse"
   */
  async getFollowedSources(req: Request, res: Response) {
    const userId = this.extractUserId(req);
    if (!userId) {
      return ResponseBuilder.unauthorized(res, "User context required");
    }

    const sources = await this.listFollowedSourcesUseCase.execute(userId);
    return ResponseBuilder.ok(res, { sources }, "Followed sources retrieved");
  }

  /**
   * @openapi
   * /api/v1/sources/follow/bulk:
   *   post:
   *     tags:
   *       - Sources
   *     summary: Sync multiple follow changes at once
   *     security:
   *       - BearerAuth: []
   *       - ApiKeyAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: "#/components/schemas/FollowStateUpdateList"
   *     responses:
   *       200:
   *         description: Follow states synchronized
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 message:
   *                   type: string
   *                 result:
   *                   $ref: "#/components/schemas/FollowSyncResult"
   *       400:
   *         description: Validation error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: "#/components/schemas/ErrorResponse"
   *       401:
   *         description: Authentication required
   *         content:
   *           application/json:
   *             schema:
   *               $ref: "#/components/schemas/ErrorResponse"
   */
  async syncFollowedSources(req: AuthenticatedRequest, res: Response) {
    const userId = this.extractUserId(req);
    if (!userId) {
      return ResponseBuilder.unauthorized(res, "User context required");
    }

    if (!Array.isArray(req.body)) {
      return ResponseBuilder.badRequest(
        res,
        "Request body must be an array of follow updates"
      );
    }

    const updates = req.body
      .filter((item) => item && typeof item === "object")
      .map((item) => {
        const candidate = item as FollowStateUpdate;
        if (
          typeof candidate.sourceId !== "string" ||
          typeof candidate.isFollowed !== "boolean"
        ) {
          return null;
        }
        return {
          sourceId: candidate.sourceId,
          isFollowed: candidate.isFollowed,
        };
      })
      .filter((update): update is FollowStateUpdate => update !== null);

    if (!updates.length) {
      return ResponseBuilder.badRequest(
        res,
        "At least one valid follow update is required"
      );
    }

    const result = await this.syncFollowedSourcesUseCase.execute(userId, updates);
    return ResponseBuilder.ok(res, result, "Followed sources synchronized");
  }

  /**
   * @openapi
   * /api/v1/sources/{sourceId}/follow:
   *   post:
   *     tags:
   *       - Sources
   *     summary: Follow a source for the authenticated user
   *     parameters:
   *       - in: path
   *         name: sourceId
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       202:
   *         description: Following source
   *       400:
   *         description: Validation error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: "#/components/schemas/ErrorResponse"
   *       401:
   *         description: Authentication required
   *         content:
   *           application/json:
   *             schema:
   *               $ref: "#/components/schemas/ErrorResponse"
   */
  async followSource(req: AuthenticatedRequest, res: Response) {
    const userId = this.extractUserId(req);
    if (!userId) {
      return ResponseBuilder.unauthorized(res, "User context required");
    }

    const { sourceId } = req.params;
    if (!sourceId) {
      return ResponseBuilder.badRequest(res, "sourceId is required");
    }

    try {
      await this.followSourceUseCase.execute(userId, sourceId);
      return ResponseBuilder.accepted(res, null, "Following source");
    } catch (error) {
      return ResponseBuilder.badRequest(
        res,
        error instanceof Error ? error.message : "Invalid request"
      );
    }
  }

  /**
   * @openapi
   * /api/v1/sources/{sourceId}/follow:
   *   delete:
   *     tags:
   *       - Sources
   *     summary: Unfollow a source for the authenticated user
   *     parameters:
   *       - in: path
   *         name: sourceId
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       204:
   *         description: Source unfollowed
   *       400:
   *         description: Validation error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: "#/components/schemas/ErrorResponse"
   *       401:
   *         description: Authentication required
   *         content:
   *           application/json:
   *             schema:
   *               $ref: "#/components/schemas/ErrorResponse"
   */
  async unfollowSource(req: AuthenticatedRequest, res: Response) {
    const userId = this.extractUserId(req);
    if (!userId) {
      return ResponseBuilder.unauthorized(res, "User context required");
    }

    const { sourceId } = req.params;
    if (!sourceId) {
      return ResponseBuilder.badRequest(res, "sourceId is required");
    }

    try {
      await this.unfollowSourceUseCase.execute(userId, sourceId);
      return ResponseBuilder.noContent(res);
    } catch (error) {
      return ResponseBuilder.badRequest(
        res,
        error instanceof Error ? error.message : "Invalid request"
      );
    }
  }
}
