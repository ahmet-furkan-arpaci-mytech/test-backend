import type { Request, Response } from "express";
import { inject, injectable } from "inversify";

import { ResponseBuilder } from "../response/response-builder.js";
import { ListSourcesUseCase } from "../../application/use-cases/source/list-sources.use-case.js";
import { ListFollowedSourcesUseCase } from "../../application/use-cases/user-source-follow/list-followed-sources.use-case.js";
import { RemoveAllFollowedSourcesUseCase } from "../../application/use-cases/user-source-follow/remove-all-followed-sources.use-case.js";
import { UpdateFollowedSourcesUseCase } from "../../application/use-cases/user-source-follow/update-followed-sources.use-case.js";
import { DI_TYPES } from "../../main/container/ioc.types.js";

type AuthenticatedRequest = Request & { user?: Record<string, any> };

@injectable()
export class UserSourceFollowController {
  constructor(
    @inject(DI_TYPES.ListSourcesUseCase)
    private readonly listSourcesUseCase: ListSourcesUseCase,
    @inject(DI_TYPES.ListFollowedSourcesUseCase)
    private readonly listFollowedSourcesUseCase: ListFollowedSourcesUseCase,
    @inject(DI_TYPES.UpdateFollowedSourcesUseCase)
    private readonly updateFollowedSourcesUseCase: UpdateFollowedSourcesUseCase,
    @inject(DI_TYPES.RemoveAllFollowedSourcesUseCase)
    private readonly removeAllFollowedSourcesUseCase: RemoveAllFollowedSourcesUseCase
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
  async getAllSources(req: Request, res: Response) {
    const sources = await this.listSourcesUseCase.execute();
    return ResponseBuilder.ok(res, { sources }, "Sources retrieved");
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
   * /api/v1/sources/followed:
   *   put:
   *     tags:
   *       - Sources
   *     summary: Replace the followed sources list for the authenticated user
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: "#/components/schemas/MyFollowedSourcesUpdate"
   *     responses:
   *       200:
   *         description: Followed sources updated
   *         content:
   *           application/json:
   *             schema:
   *               $ref: "#/components/schemas/SuccessResponse"
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
  async updateMyFollowedSources(req: Request, res: Response) {
    const userId = this.extractUserId(req);
    if (!userId) {
      return ResponseBuilder.unauthorized(res, "User context required");
    }

    const { sourceIds } = req.body as { sourceIds?: unknown };
    if (!Array.isArray(sourceIds)) {
      return ResponseBuilder.badRequest(res, "sourceIds must be an array");
    }

    const normalized = sourceIds.filter((id) => typeof id === "string");
    await this.updateFollowedSourcesUseCase.execute(userId, normalized);
    return ResponseBuilder.ok(res, null, "Followed sources updated");
  }

  /**
   * @openapi
   * /api/v1/sources/followed:
   *   delete:
   *     tags:
   *       - Sources
   *     summary: Remove all followed sources for the authenticated user
   *     responses:
   *       204:
   *         description: Followed sources cleared
   *       401:
   *         description: Authentication required
   *         content:
   *           application/json:
   *             schema:
   *               $ref: "#/components/schemas/ErrorResponse"
   */
  async clearFollowedSources(req: Request, res: Response) {
    const userId = this.extractUserId(req);
    if (!userId) {
      return ResponseBuilder.unauthorized(res, "User context required");
    }

    await this.removeAllFollowedSourcesUseCase.execute(userId);
    return ResponseBuilder.noContent(res);
  }
}
