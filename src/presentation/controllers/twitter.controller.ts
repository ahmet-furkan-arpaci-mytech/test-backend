import type { Request, Response } from "express";
import { inject, injectable } from "inversify";

import { ResponseBuilder } from "../response/response-builder.js";
import { DI_TYPES } from "../../main/container/ioc.types.js";
import { ListTweetsUseCase } from "../../application/use-cases/twitter/list-tweets.use-case.js";

const parseBooleanQuery = (value: unknown) =>
  value === "true" || value === "1" || value === true;

@injectable()
export class TwitterController {
  constructor(
    @inject(DI_TYPES.ListTweetsUseCase)
    private readonly listTweetsUseCase: ListTweetsUseCase
  ) {}

  private parseFilterQuery(req: Request) {
    const page = Number(req.query.page ?? 1);
    const pageSize = Number(req.query.pageSize ?? 10);
    const isPopular = parseBooleanQuery(req.query.isPopular);

    return { page, pageSize, isPopular };
  }

  /**
   * @openapi
   * /api/v1/twitter/tweets:
   *   get:
   *     tags:
   *       - Twitter
   *     summary: List tweets
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
    *         name: isPopular
    *         schema:
    *           type: boolean
    *         description: When true, return only tweets marked as popular
    *     responses:
    *       200:
    *         description: Paginated tweets retrieved
    *         content:
    *           application/json:
    *             schema:
    *               $ref: "#/components/schemas/PaginatedTweets"
   */

  async listTweets(req: Request, res: Response) {
    const { page, pageSize, isPopular } = this.parseFilterQuery(req);
    const result = await this.listTweetsUseCase.execute({
      page,
      pageSize,
      isPopular,
    });
    return ResponseBuilder.ok(res, result, "Tweets retrieved");
  }
}
