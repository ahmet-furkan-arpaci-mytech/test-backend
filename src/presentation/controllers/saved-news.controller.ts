import type { Request, Response } from "express";
import { inject, injectable } from "inversify";

import { AppError } from "../../application/exceptions/app-error.js";
import { ListSavedNewsUseCase } from "../../application/use-cases/saved-news/list-saved-news.use-case.js";
import { RemoveSavedNewsUseCase } from "../../application/use-cases/saved-news/remove-saved-news.use-case.js";
import { SaveNewsUseCase } from "../../application/use-cases/saved-news/save-news.use-case.js";
import { ResponseBuilder } from "../response/response-builder.js";
import { DI_TYPES } from "../../main/container/ioc.types.js";

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

  /**
   * @openapi
   * /api/v1/saved-news:
   *   post:
   *     tags:
   *       - Saved News
   *     summary: Save a news item for a user
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
   *       404:
   *         description: User or news not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: "#/components/schemas/ErrorResponse"
   */
  async save(req: Request, res: Response) {
    const savedNews = await this.saveNewsUseCase.execute(req.body);
    return ResponseBuilder.created(res, savedNews, "Saved news created");
  }

  /**
   * @openapi
   * /api/v1/saved-news/user/{userId}:
   *   get:
   *     tags:
   *       - Saved News
   *     summary: List saved news for a user
   *     parameters:
   *       - in: path
   *         name: userId
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Saved news list
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: "#/components/schemas/SavedNewsResponse"
   */
  async listByUser(req: Request, res: Response) {
    const savedNews = await this.listSavedNewsUseCase.execute(req.params.userId);
    return ResponseBuilder.ok(res, savedNews, "Saved news retrieved");
  }

  /**
   * @openapi
   * /api/v1/saved-news/{savedNewsId}:
   *   delete:
   *     tags:
   *       - Saved News
   *     summary: Remove a saved news entry
   *     parameters:
   *       - in: path
   *         name: savedNewsId
   *         required: true
   *         schema:
   *           type: string
   *       - in: query
   *         name: userId
   *         required: true
   *         schema:
   *           type: string
   *         description: Ownership check
   *     responses:
   *       204:
   *         description: Saved news removed
   *       404:
   *         description: Saved news not found
   */
  async remove(req: Request, res: Response) {
    const userId = req.query.userId;
    if (!userId || typeof userId !== "string") {
      throw new AppError("userId query parameter is required", 400);
    }

    await this.removeSavedNewsUseCase.execute({
      userId,
      savedNewsId: req.params.savedNewsId,
    });

    return ResponseBuilder.noContent(res);
  }
}
