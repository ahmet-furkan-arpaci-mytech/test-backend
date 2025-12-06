import type { Request, Response } from "express";
import { inject, injectable } from "inversify";

import { AppError } from "../../application/exceptions/app-error.js";
import { ListSavedNewsUseCase } from "../../application/use-cases/saved-news/list-saved-news.use-case.js";
import { RemoveSavedNewsUseCase } from "../../application/use-cases/saved-news/remove-saved-news.use-case.js";
import { SaveNewsUseCase } from "../../application/use-cases/saved-news/save-news.use-case.js";
import { ResponseBuilder } from "../response/response-builder.js";
import { DI_TYPES } from "../../main/container/ioc.types.js";
import { SavedNews } from "../../domain/saved-news/saved-news.js";

type AuthenticatedRequest = Request & { user?: Record<string, any> };

const toSavedNewsResponse = (savedNews: SavedNews) => ({
  id: savedNews.id,
  userId: savedNews.userId,
  newsId: savedNews.newsId,
  savedAt: savedNews.savedAt,
});

@injectable()
export class SavedNewsController {
  constructor(
    @inject(DI_TYPES.SaveNewsUseCase)
    private readonly saveNewsUseCase: SaveNewsUseCase,
    @inject(DI_TYPES.ListSavedNewsUseCase)
    private readonly listSavedNewsUseCase: ListSavedNewsUseCase,
    @inject(DI_TYPES.RemoveSavedNewsUseCase)
    private readonly removeSavedNewsUseCase: RemoveSavedNewsUseCase
  ) {}

  private extractUserId(req: AuthenticatedRequest): string | undefined {
    return req.user?.sub ?? req.user?.id ?? req.user?.userId;
  }

  /**
   * @openapi
   * /api/v1/saved-news:
   *   post:
   *     tags:
   *       - Saved News
   *     summary: Save a news item for the authenticated user
   *     security:
   *       - BearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: "#/components/schemas/SaveNewsRequest"
   *     responses:
   *       201:
   *         description: Saved news entry created
   *         content:
   *           application/json:
   *             schema:
   *               $ref: "#/components/schemas/SavedNewsResponse"
   *       400:
   *         description: Validation failed
   *         content:
   *           application/json:
   *             schema:
   *               $ref: "#/components/schemas/ErrorResponse"
   *       401:
   *         description: User context required
   *         content:
   *           application/json:
   *             schema:
   *               $ref: "#/components/schemas/ErrorResponse"
   *       404:
   *         description: News not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: "#/components/schemas/ErrorResponse"
   */
  async save(req: AuthenticatedRequest, res: Response) {
    const userId = this.extractUserId(req);
    if (!userId) {
      return ResponseBuilder.unauthorized(res, "User context required");
    }

    const newsId =
      typeof req.body.newsId === "string" ? req.body.newsId.trim() : "";
    if (!newsId) {
      return ResponseBuilder.badRequest(res, "newsId is required");
    }

    const savedNews = await this.saveNewsUseCase.execute({ userId, newsId });
    return ResponseBuilder.created(
      res,
      toSavedNewsResponse(savedNews),
      "Saved news created"
    );
  }

  /**
   * @openapi
   * /api/v1/saved-news:
   *   get:
   *     tags:
   *       - Saved News
   *     summary: List saved news for the authenticated user
   *     security:
   *       - BearerAuth: []
   *     responses:
   *       200:
   *         description: Saved news list
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: "#/components/schemas/SavedNewsResponse"
   *       401:
   *         description: User context required
   *         content:
   *           application/json:
   *             schema:
   *               $ref: "#/components/schemas/ErrorResponse"
   */
  async listByUser(req: AuthenticatedRequest, res: Response) {
    const userId = this.extractUserId(req);
    if (!userId) {
      return ResponseBuilder.unauthorized(res, "User context required");
    }

    const savedNews = await this.listSavedNewsUseCase.execute(userId);
    return ResponseBuilder.ok(
      res,
      savedNews.map(toSavedNewsResponse),
      "Saved news retrieved"
    );
  }

  /**
   * @openapi
   * /api/v1/saved-news/{savedNewsId}:
   *   delete:
   *     tags:
   *       - Saved News
   *     summary: Remove a saved news entry
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - in: path
   *         name: savedNewsId
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       204:
   *         description: Saved news removed
   *       401:
   *         description: User context required
   *         content:
   *           application/json:
   *             schema:
   *               $ref: "#/components/schemas/ErrorResponse"
   *       404:
   *         description: Saved news not found
   */
  async remove(req: AuthenticatedRequest, res: Response) {
    const userId = this.extractUserId(req);
    if (!userId) {
      return ResponseBuilder.unauthorized(res, "User context required");
    }

    const savedNewsId = req.params.savedNewsId;
    if (!savedNewsId) {
      throw new AppError("savedNewsId path parameter is required", 400);
    }

    await this.removeSavedNewsUseCase.execute({
      userId,
      savedNewsId,
    });

    return ResponseBuilder.noContent(res);
  }
}
