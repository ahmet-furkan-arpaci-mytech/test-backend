import type { Request, Response } from "express";
import { inject, injectable } from "inversify";

import { ResponseBuilder } from "../response/response-builder.js";
import { CreateNewsUseCase } from "../../application/use-cases/news/create-news.use-case.js";
import { ListNewsUseCase } from "../../application/use-cases/news/list-news.use-case.js";
import { GetNewsByCategoryUseCase } from "../../application/use-cases/news/get-news-by-category.use-case.js";
import { ListSavedNewsUseCase } from "../../application/use-cases/saved-news/list-saved-news.use-case.js";
import { ListCategoriesUseCase } from "../../application/use-cases/category/list-categories.use-case.js";
import { ListFollowedSourcesUseCase } from "../../application/use-cases/user-source-follow/list-followed-sources.use-case.js";
import { DI_TYPES } from "../../main/container/ioc.types.js";
import { PaginatedResult } from "../../domain/common/paginated-result.js";
import { News } from "../../domain/news/news.js";

const parseBooleanQuery = (value: unknown) =>
  value === "true" || value === "1" || value === true;

type AuthenticatedRequest = Request & { user?: Record<string, any> };
type CategoryMeta = {
  name: string;
  colorCode: string;
};

type NewsResponseItem = {
  id: string;
  title: string;
  content: string;
  imageUrl: string;
  categoryId: string;
  sourceId: string;
  publishedAt: Date;
  isLatest: boolean;
  isPopular: boolean;
  sourceName?: string;
  categoryName?: string;
  isSaved: boolean;
  colorCode?: string;
};
type PaginatedNewsResponse = PaginatedResult<NewsResponseItem>;

@injectable()
export class NewsController {
  constructor(
    @inject(DI_TYPES.CreateNewsUseCase)
    private readonly createNewsUseCase: CreateNewsUseCase,
    @inject(DI_TYPES.ListNewsUseCase)
    private readonly listNewsUseCase: ListNewsUseCase,
    @inject(DI_TYPES.GetNewsByCategoryUseCase)
    private readonly getNewsByCategoryUseCase: GetNewsByCategoryUseCase,
    @inject(DI_TYPES.ListFollowedSourcesUseCase)
    private readonly listFollowedSourcesUseCase: ListFollowedSourcesUseCase,
    @inject(DI_TYPES.ListSavedNewsUseCase)
    private readonly listSavedNewsUseCase: ListSavedNewsUseCase,
    @inject(DI_TYPES.ListCategoriesUseCase)
    private readonly listCategoriesUseCase: ListCategoriesUseCase
  ) {}

  private extractUserId(req: AuthenticatedRequest): string | undefined {
    return req.user?.sub ?? req.user?.id ?? req.user?.userId;
  }

  private parseFilterQuery(req: Request) {
    const page = Number(req.query.page ?? 1);
    const pageSize = Number(req.query.pageSize ?? 10);
    const sourceParam = (req.query.sourceIds ?? "") as string;
    const sourceIds = sourceParam
      ? sourceParam
          .split(",")
          .map((id) => id.trim())
          .filter(Boolean)
      : [];
    const isMySourced = parseBooleanQuery(req.query.isMySourced);
    const isLatest = parseBooleanQuery(req.query.isLatest);
    const isPopular = parseBooleanQuery(req.query.isPopular);

    return { page, pageSize, sourceIds, isMySourced, isLatest, isPopular };
  }

  private async resolveSourceIds(
    userId: string | undefined,
    sourceIds: string[],
    isMySourced: boolean
  ): Promise<string[]> {
    if (!isMySourced) {
      return sourceIds;
    }

    if (!userId) {
      throw new Error("User context required");
    }

    if (sourceIds.length === 0) {
      const followedSources = await this.listFollowedSourcesUseCase.execute(
        userId
      );
      sourceIds = followedSources.map((source) => source.id);
    }

    return sourceIds;
  }

  private async loadCategoryMetadata(): Promise<Record<string, CategoryMeta>> {
    const categories = await this.listCategoriesUseCase.execute();
    return categories.reduce<Record<string, CategoryMeta>>((map, category) => {
      map[category.id] = { name: category.name, colorCode: category.colorCode };
      return map;
    }, {});
  }

  private async attachSavedStatus(
    paginatedResult: PaginatedResult<News>,
    userId?: string,
    categoryMetadata: Record<string, CategoryMeta> = {}
  ): Promise<PaginatedNewsResponse> {
    const savedIds = new Set<string>();
    if (userId) {
      const savedNews = await this.listSavedNewsUseCase.execute(userId);
      savedNews.forEach((saved) => savedIds.add(saved.newsId));
    }

    return {
      ...paginatedResult,
      items: paginatedResult.items.map((news) => ({
        id: news.id,
        title: news.title,
        content: news.content,
        imageUrl: news.imageUrl,
        categoryId: news.categoryId,
        sourceId: news.sourceId,
        publishedAt: news.publishedAt,
        isLatest: news.isLatest,
        isPopular: news.isPopular,
        sourceName: news.sourceName,
    categoryName: news.categoryName ?? categoryMetadata[news.categoryId]?.name,
    isSaved: savedIds.has(news.id),
    colorCode: categoryMetadata[news.categoryId]?.colorCode,
      })),
    };
  }

  /**
   * @openapi
   * /api/v1/news:
   *   post:
   *     tags:
   *       - News
   *     summary: Publish a news item
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: "#/components/schemas/CreateNews"
   *     responses:
   *       201:
   *         description: News created
   *         content:
   *           application/json:
   *             schema:
   *               $ref: "#/components/schemas/News"
   *       400:
   *         description: Validation error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: "#/components/schemas/ErrorResponse"
   */
  async createNews(req: Request, res: Response) {
    const news = await this.createNewsUseCase.execute(req.body);
    return ResponseBuilder.created(res, news, "News created");
  }

  /**
   * @openapi
   * /api/v1/news:
   *   get:
   *     tags:
   *       - News
   *     summary: List news with pagination and optional filters
   *     parameters:
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *         description: Page number (starts at 1)
   *       - in: query
   *         name: pageSize
   *         schema:
   *           type: integer
   *         description: Items per page
   *       - in: query
   *         name: isLatest
   *         schema:
   *           type: boolean
   *         description: When true, return only news marked as latest
   *       - in: query
   *         name: isPopular
   *         schema:
   *           type: boolean
   *         description: When true, return only news marked as popular
   *       - in: query
   *         name: isMySourced
   *         schema:
   *           type: boolean
   *         description: When true, return news from followed sources
   *       - in: query
   *         name: sourceIds
   *         schema:
   *           type: string
   *         description: Optional comma-separated list of source IDs (overrides followed sources)
   *     responses:
   *       200:
   *         description: Paginated news list
   *         content:
   *           application/json:
   *             schema:
   *               $ref: "#/components/schemas/PaginatedNews"
   */
  async listNews(req: Request, res: Response) {
    const { page, pageSize, sourceIds, isMySourced, isLatest, isPopular } =
      this.parseFilterQuery(req);

    const userId = this.extractUserId(req);

    try {
      const resolvedSourceIds = await this.resolveSourceIds(
        userId,
        sourceIds,
        isMySourced
      );

      if (isMySourced && resolvedSourceIds.length === 0) {
        return ResponseBuilder.ok(
          res,
          { items: [], total: 0, page, pageSize },
          "News retrieved"
        );
      }

      const result = await this.listNewsUseCase.execute({
        page,
        pageSize,
        isLatest,
        isPopular,
        sourceIds: resolvedSourceIds.length
          ? resolvedSourceIds
          : undefined,
      });
      const categoryMetadata = await this.loadCategoryMetadata();
      const augmented = await this.attachSavedStatus(
        result,
        userId,
        categoryMetadata
      );
      return ResponseBuilder.ok(res, augmented, "News retrieved");
    } catch (error) {
      if (error instanceof Error && error.message === "User context required") {
        return ResponseBuilder.unauthorized(res, error.message);
      }

      return ResponseBuilder.badRequest(
        res,
        error instanceof Error ? error.message : "Invalid request"
      );
    }
  }

  /**
   * @openapi
   * /api/v1/news/category/{categoryId}:
   *   get:
   *     tags:
   *       - News
   *     summary: List news by category
   *     parameters:
   *       - in: path
   *         name: categoryId
   *         required: true
   *         schema:
   *           type: string
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *       - in: query
   *         name: pageSize
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Paginated news for category
   *         content:
   *           application/json:
   *             schema:
   *               $ref: "#/components/schemas/PaginatedNews"
   */
  async listNewsByCategory(req: Request, res: Response) {
    const page = Number(req.query.page ?? 1);
    const pageSize = Number(req.query.pageSize ?? 10);
    const result = await this.getNewsByCategoryUseCase.execute({
      categoryId: req.params.categoryId,
      page,
      pageSize,
    });
    return ResponseBuilder.ok(res, result, "News retrieved");
  }

  /**
   * @openapi
   * /api/v1/news/filter:
   *   get:
   *     tags:
   *       - News
   *     summary: Filter news without joining related entities
   *     parameters:
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *         description: Page number (starts at 1)
   *       - in: query
   *         name: pageSize
   *         schema:
   *           type: integer
   *         description: Items per page
   *       - in: query
   *         name: isLatest
   *         schema:
   *           type: boolean
   *         description: When true, return only news marked as latest
   *       - in: query
   *         name: isPopular
   *         schema:
   *           type: boolean
   *         description: When true, return only news marked as popular
   *       - in: query
   *         name: isMySourced
   *         schema:
   *           type: boolean
   *         description: When true, return news from followed sources
   *       - in: query
   *         name: sourceIds
   *         schema:
   *           type: string
   *         description: Optional comma-separated list of source IDs (overrides followed sources)
   *     responses:
   *       200:
   *         description: Paginated filtered news without relationships
   *         content:
   *           application/json:
   *             schema:
   *               $ref: "#/components/schemas/PaginatedNews"
   */
  async filterNews(req: Request, res: Response) {
    const { page, pageSize, sourceIds, isMySourced, isLatest, isPopular } =
      this.parseFilterQuery(req);
    const userId = this.extractUserId(req);

    try {
      const resolvedSourceIds = await this.resolveSourceIds(
        userId,
        sourceIds,
        isMySourced
      );

      if (isMySourced && resolvedSourceIds.length === 0) {
        return ResponseBuilder.ok(
          res,
          { items: [], total: 0, page, pageSize },
          "Filtered news retrieved"
        );
      }

      const result = await this.listNewsUseCase.execute({
        page,
        pageSize,
        isLatest,
        isPopular,
        sourceIds: resolvedSourceIds.length
          ? resolvedSourceIds
          : undefined,
      });
      const categoryMetadata = await this.loadCategoryMetadata();
      const augmented = await this.attachSavedStatus(
        result,
        userId,
        categoryMetadata
      );
      return ResponseBuilder.ok(res, augmented, "Filtered news retrieved");
    } catch (error) {
      if (error instanceof Error && error.message === "User context required") {
        return ResponseBuilder.unauthorized(res, error.message);
      }

      return ResponseBuilder.badRequest(
        res,
        error instanceof Error ? error.message : "Invalid request"
      );
    }
  }
}
