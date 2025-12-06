import type { Request, Response } from "express";
import { inject, injectable } from "inversify";

import { ResponseBuilder } from "../response/response-builder.js";
import { ListCategoriesUseCase } from "../../application/use-cases/category/list-categories.use-case.js";
import { ListCategoriesWithNewsUseCase } from "../../application/use-cases/category/list-categories-with-news.use-case.js";
import { DI_TYPES } from "../../main/container/ioc.types.js";
import { Category } from "../../domain/category/category.js";
import { News } from "../../domain/news/news.js";

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
  publishedAt: news.publishedAt,
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
    private readonly listCategoriesWithNewsUseCase: ListCategoriesWithNewsUseCase
  ) {}

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
   *         name: isPopular
   *         schema:
   *           type: boolean
   *         description: When true, return only news marked as popular
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
    const isLatest = parseBooleanQuery(req.query.isLatest);
    const isPopular = parseBooleanQuery(req.query.isPopular);

    try {
      const result = await this.listCategoriesWithNewsUseCase.execute({
        page,
        pageSize,
        isLatest,
        isPopular,
      });
      const serialized = {
        items: result.items.map((item) => ({
          category: toCategoryResponse(item.category),
          news: item.news.map(toNewsResponse),
        })),
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
