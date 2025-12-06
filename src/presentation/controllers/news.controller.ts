import type { Request, Response } from "express";
import { inject, injectable } from "inversify";

import { ResponseBuilder } from "../response/response-builder.js";
import { ListNewsUseCase } from "../../application/use-cases/news/list-news.use-case.js";
import { GetNewsByCategoryUseCase } from "../../application/use-cases/news/get-news-by-category.use-case.js";
import { ListSavedNewsUseCase } from "../../application/use-cases/saved-news/list-saved-news.use-case.js";
import { ListCategoriesUseCase } from "../../application/use-cases/category/list-categories.use-case.js";
import { DI_TYPES } from "../../main/container/ioc.types.js";
import { PaginatedResult } from "../../domain/common/paginated-result.js";
import { News } from "../../domain/news/news.js";
import { ListFollowedSourcesUseCase } from "../../application/use-cases/user-source-follow/list-followed-sources.use-case.js";

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
    @inject(DI_TYPES.ListNewsUseCase)
    private readonly listNewsUseCase: ListNewsUseCase,
    @inject(DI_TYPES.GetNewsByCategoryUseCase)
    private readonly getNewsByCategoryUseCase: GetNewsByCategoryUseCase,
    @inject(DI_TYPES.ListSavedNewsUseCase)
    private readonly listSavedNewsUseCase: ListSavedNewsUseCase,
    @inject(DI_TYPES.ListCategoriesUseCase)
    private readonly listCategoriesUseCase: ListCategoriesUseCase,
    @inject(DI_TYPES.ListFollowedSourcesUseCase)
    private readonly listFollowedSourcesUseCase: ListFollowedSourcesUseCase
  ) {}

  private extractUserId(req: AuthenticatedRequest): string | undefined {
    return req.user?.sub ?? req.user?.id ?? req.user?.userId;
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
   *   get:
   *     tags:
   *       - News
   *     summary: List the latest or personalized news feed (limited to 20 items)
   *     parameters:
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
   *         description: News list
   *         content:
   *           application/json:
   *             schema:
   *               $ref: "#/components/schemas/PaginatedNews"
   */
  async listNews(req: Request, res: Response) {
    const isLatest = parseBooleanQuery(req.query.isLatest);
    const forYou = parseBooleanQuery(req.query.forYou);
    const userId = this.extractUserId(req);

    let sourceIds: string[] | undefined;
    if (forYou) {
      if (!userId) {
        return ResponseBuilder.unauthorized(
          res,
          "User context required for personalized feed"
        );
      }
      const followedSources = await this.listFollowedSourcesUseCase.execute(
        userId
      );
      sourceIds = followedSources.map((source) => source.id);
      if (!sourceIds.length) {
        const emptyResult: PaginatedResult<News> = {
          items: [],
          total: 0,
          page: 1,
          pageSize: 20,
        };
        const categoryMetadata = await this.loadCategoryMetadata();
        const augmented = await this.attachSavedStatus(
          emptyResult,
          userId,
          categoryMetadata
        );
        return ResponseBuilder.ok(res, augmented, "News retrieved");
      }
    }

    const result = await this.listNewsUseCase.execute({
      page: 1,
      pageSize: 20,
      isLatest: isLatest ? true : undefined,
      sourceIds,
    });
    const categoryMetadata = await this.loadCategoryMetadata();
    const augmented = await this.attachSavedStatus(
      result,
      userId,
      categoryMetadata
    );
    return ResponseBuilder.ok(res, augmented, "News retrieved");
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

}
