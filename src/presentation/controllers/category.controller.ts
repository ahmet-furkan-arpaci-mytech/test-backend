import type { Request, Response } from "express";
import { inject, injectable } from "inversify";

import { ResponseBuilder } from "../response/response-builder.js";
import { CreateCategoryUseCase } from "../../application/use-cases/category/create-category.use-case.js";
import { ListCategoriesUseCase } from "../../application/use-cases/category/list-categories.use-case.js";
import { ListCategoriesWithNewsUseCase } from "../../application/use-cases/category/list-categories-with-news.use-case.js";
import { ListFollowedSourcesUseCase } from "../../application/use-cases/user-source-follow/list-followed-sources.use-case.js";
import { DI_TYPES } from "../../main/container/ioc.types.js";

const parseBooleanQuery = (value: unknown) =>
  value === "true" || value === "1" || value === true;

type AuthenticatedRequest = Request & { user?: Record<string, any> };

@injectable()
export class CategoryController {
  constructor(
    @inject(DI_TYPES.CreateCategoryUseCase)
    private readonly createCategoryUseCase: CreateCategoryUseCase,
    @inject(DI_TYPES.ListCategoriesUseCase)
    private readonly listCategoriesUseCase: ListCategoriesUseCase,
    @inject(DI_TYPES.ListCategoriesWithNewsUseCase)
    private readonly listCategoriesWithNewsUseCase: ListCategoriesWithNewsUseCase,
    @inject(DI_TYPES.ListFollowedSourcesUseCase)
    private readonly listFollowedSourcesUseCase: ListFollowedSourcesUseCase
  ) {}

  private extractUserId(req: AuthenticatedRequest): string | undefined {
    return req.user?.sub ?? req.user?.id ?? req.user?.userId;
  }

  /**
   * @openapi
   * /api/v1/categories:
   *   post:
   *     tags:
   *       - Categories
   *     summary: Create a category
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: "#/components/schemas/CreateCategory"
   *     responses:
   *       201:
   *         description: Created category
   *         content:
   *           application/json:
   *             schema:
   *               $ref: "#/components/schemas/Category"
   */
  async createCategory(req: Request, res: Response) {
    const category = await this.createCategoryUseCase.execute(req.body);
    return ResponseBuilder.created(res, category, "Category created");
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
    return ResponseBuilder.ok(res, categories, "Categories retrieved");
  }

  /**
   * @openapi
   * /api/v1/categories/with-news:
   *   get:
   *     tags:
   *       - Categories
   *     summary: List categories along with their related news
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
   *         description: Paginated categories with news retrieved
   *         content:
   *           application/json:
   *             schema:
   *               $ref: "#/components/schemas/PaginatedCategoriesWithNews"
   */
  async listCategoriesWithNews(req: Request, res: Response) {
    const page = Number(req.query.page ?? 1);
    const pageSize = Number(req.query.pageSize ?? 10);
    const sourceParam = (req.query.sourceIds ?? "") as string;
    let sourceIds = sourceParam
      ? sourceParam
          .split(",")
          .map((id) => id.trim())
          .filter(Boolean)
      : [];

    const isMySourced = parseBooleanQuery(req.query.isMySourced);
    const isLatest = parseBooleanQuery(req.query.isLatest);
    const isPopular = parseBooleanQuery(req.query.isPopular);

    if (isMySourced) {
      const userId = this.extractUserId(req);
      if (!userId) {
        return ResponseBuilder.unauthorized(res, "User context required");
      }

      if (sourceIds.length === 0) {
        const followed = await this.listFollowedSourcesUseCase.execute(userId);
        sourceIds = followed.map((source) => source.id);
      }

      if (sourceIds.length === 0) {
        return ResponseBuilder.ok(
          res,
          { items: [], total: 0, page, pageSize },
          "Categories with news retrieved"
        );
      }
    }

    try {
      const result = await this.listCategoriesWithNewsUseCase.execute({
        page,
        pageSize,
        isLatest,
        isPopular,
        sourceIds: sourceIds.length ? sourceIds : undefined,
      });
      return ResponseBuilder.ok(
        res,
        result,
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
