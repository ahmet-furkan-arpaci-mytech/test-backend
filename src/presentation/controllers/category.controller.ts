import type { Request, Response } from "express";
import { inject, injectable } from "inversify";

import { ResponseBuilder } from "../response/response-builder.js";
import { ListCategoriesUseCase } from "../../application/use-cases/category/list-categories.use-case.js";
import { ListCategoriesWithNewsUseCase } from "../../application/use-cases/category/list-categories-with-news.use-case.js";
import { ListSavedNewsUseCase } from "../../application/use-cases/saved-news/list-saved-news.use-case.js";
import { DI_TYPES } from "../../main/container/ioc.types.js";
import { Category } from "../../domain/category/category.js";
import { News } from "../../domain/news/news.js";

type AuthenticatedRequest = Request & { user?: Record<string, any> };

const parseBooleanQuery = (value: unknown) =>
  value === "true" || value === "1" || value === true;

const toCategoryResponse = (category: Category) => ({
  id: category.id,
  name: category.name,
  description: category.description,
  colorCode: category.colorCode,
  imageUrl: category.imageUrl,
});

const toNewsResponse = (news: News) => ({
  id: news.id,
  title: news.title,
  content: news.content,
  imageUrl: news.imageUrl,
  categoryId: news.categoryId,
  sourceId: news.sourceId,
  sourceProfilePictureUrl: news.sourceProfilePictureUrl,
  sourceTitle: news.sourceTitle,
  publishedAt: news.publishedAt,
  isSaved: news.isSaved,
  isLatest: news.isLatest,
  isPopular: news.isPopular,
  sourceName: news.sourceName,
  categoryName: news.categoryName,
});

@injectable()
export class CategoryController {
  constructor(
    @inject(DI_TYPES.ListCategoriesUseCase)
    private readonly listCategoriesUseCase: ListCategoriesUseCase,
    @inject(DI_TYPES.ListCategoriesWithNewsUseCase)
    private readonly listCategoriesWithNewsUseCase: ListCategoriesWithNewsUseCase,
    @inject(DI_TYPES.ListSavedNewsUseCase)
    private readonly listSavedNewsUseCase: ListSavedNewsUseCase
  ) {}

  private extractUserId(req: AuthenticatedRequest): string | undefined {
    return req.user?.sub ?? req.user?.id ?? req.user?.userId;
  }

  private async loadSavedNewsIds(userId?: string): Promise<Set<string>> {
    if (!userId) {
      return new Set();
    }

    const savedNews = await this.listSavedNewsUseCase.execute(userId);
    return new Set(savedNews.map((entry) => entry.newsId));
  }

  /**
   * @openapi
   * /api/v1/categories:
   *   get:
   *     tags:
   *       - Categories
   *     summary: List all categories
   *     responses:
   *       200:
   *         description: Available categories
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: "#/components/schemas/Category"
   */
  async listCategories(req: Request, res: Response) {
    const categories = await this.listCategoriesUseCase.execute();
    return ResponseBuilder.ok(
      res,
      categories.map(toCategoryResponse),
      "Categories retrieved"
    );
  }

  /**
   * @openapi
   * /api/v1/categories/with-news:
   *   get:
   *     tags:
   *       - Categories
   *     summary: List categories grouped around the latest matching news (news pagination)
   *     parameters:
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *         description: News page number (starts at 1 and counts news entries across categories)
   *       - in: query
   *         name: pageSize
   *         schema:
   *           type: integer
   *         description: Maximum news entries returned per page (split across the categories that contain them)
   *       - in: query
   *         name: isLatest
   *         schema:
   *           type: boolean
   *         description: When true, return only news marked as latest
   *       - in: query
   *         name: forYou
   *         schema:
   *           type: boolean
   *         description: When true, show news from followed sources (requires auth)
   *     responses:
   *       200:
   *         description: Paginated categories with news retrieved
   *         content:
   *           application/json:
   *             schema:
   *               $ref: "#/components/schemas/PaginatedCategoriesWithNews"
   */
  async listCategoriesWithNews(req: AuthenticatedRequest, res: Response) {
    const page = Number(req.query.page ?? 1);
    const pageSize = Number(req.query.pageSize ?? 10);
    const isLatest = parseBooleanQuery(req.query.isLatest);
    const isPopular = parseBooleanQuery(req.query.forYou);
    const userId = this.extractUserId(req);

    try {
      const [result, savedNewsIds] = await Promise.all([
        this.listCategoriesWithNewsUseCase.execute({
          page,
          pageSize,
          isLatest,
          isPopular,
        }),
        this.loadSavedNewsIds(userId),
      ]);

      const serialized = {
        items: result.items.map((item) => {
          const news = item.news.map((n) => ({
            ...toNewsResponse(n),
            isSaved: savedNewsIds.has(n.id),
          }));
          return {
            category: toCategoryResponse(item.category),
            news,
          };
        }),
        total: result.total,
        page: result.page,
        pageSize: result.pageSize,
      };
      return ResponseBuilder.ok(
        res,
        serialized,
        "Categories with news retrieved"
      );
    } catch (error) {
      return ResponseBuilder.badRequest(
        res,
        error instanceof Error
          ? error.message
          : "Failed to retrieve categories with news"
      );
    }
  }
}
