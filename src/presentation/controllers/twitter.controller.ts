import type { Request, Response } from "express";
import { inject, injectable } from "inversify";

import { ResponseBuilder } from "../response/response-builder.js";
import { CreateTwitterAccountUseCase } from "../../application/use-cases/twitter-account/create-twitter-account.use-case.js";
import { ListTwitterAccountsUseCase } from "../../application/use-cases/twitter-account/list-twitter-accounts.use-case.js";
import { FollowTwitterAccountUseCase } from "../../application/use-cases/twitter-account/follow-twitter-account.use-case.js";
import { UnfollowTwitterAccountUseCase } from "../../application/use-cases/twitter-account/unfollow-twitter-account.use-case.js";
import { ListFollowedTwitterAccountsUseCase } from "../../application/use-cases/twitter-account/list-followed-twitter-accounts.use-case.js";
import { DI_TYPES } from "../../main/container/ioc.types.js";
import { ListTweetsUseCase } from "../../application/use-cases/twitter/list-tweets.use-case.js";

const parseBooleanQuery = (value: unknown) =>
  value === "true" || value === "1" || value === true;

type AuthenticatedRequest = Request & { user?: Record<string, any> };

const parsePagination = (req: Request) => ({
  page: Number(req.query.page ?? 1),
  pageSize: Number(req.query.pageSize ?? 10),
});

@injectable()
export class TwitterController {
  constructor(
    @inject(DI_TYPES.ListTwitterAccountsUseCase)
    private readonly listAccountsUseCase: ListTwitterAccountsUseCase,
    @inject(DI_TYPES.CreateTwitterAccountUseCase)
    private readonly createAccountUseCase: CreateTwitterAccountUseCase,
    @inject(DI_TYPES.FollowTwitterAccountUseCase)
    private readonly followUseCase: FollowTwitterAccountUseCase,
    @inject(DI_TYPES.UnfollowTwitterAccountUseCase)
    private readonly unfollowUseCase: UnfollowTwitterAccountUseCase,
    @inject(DI_TYPES.ListFollowedTwitterAccountsUseCase)
    private readonly listFollowedUseCase: ListFollowedTwitterAccountsUseCase,
    @inject(DI_TYPES.ListTweetsUseCase)
    private readonly listTweetsUseCase: ListTweetsUseCase,
  ) {}

  private extractUserId(req: AuthenticatedRequest): string | undefined {
    return req.user?.sub ?? req.user?.id ?? req.user?.userId;
  }

  private parseFilterQuery(req: Request) {
    const page = Number(req.query.page ?? 1);
    const pageSize = Number(req.query.pageSize ?? 10);
    const isPopular = parseBooleanQuery(req.query.isPopular);
    const isMyFollowed = parseBooleanQuery(req.query.isMyFollowed);
    const accountParam = (req.query.accountIds ?? "") as string;
    const accountIds = accountParam
      ? accountParam
          .split(",")
          .map((id) => id.trim())
          .filter(Boolean)
      : [];

    return { page, pageSize, isPopular, isMyFollowed, accountIds };
  }

  private async fetchFollowedAccountIds(
    req: AuthenticatedRequest
  ): Promise<string[]> {
    const userId = this.extractUserId(req);
    if (!userId) {
      throw new Error("User context required");
    }

    const followed = await this.listFollowedUseCase.execute({
      userId,
      page: 1,
      pageSize: Number.MAX_SAFE_INTEGER,
    });
    return followed.items.map((account) => account.id);
  }

  private async resolveAccountIds(
    req: AuthenticatedRequest,
    accountIds: string[],
    isMyFollowed: boolean
  ): Promise<string[]> {
    if (!isMyFollowed) {
      return accountIds;
    }

    if (accountIds.length > 0) {
      return accountIds;
    }

    return this.fetchFollowedAccountIds(req);
  }
  /**
   * @openapi
   * /api/v1/twitter/accounts:
   *   get:
   *     tags:
   *       - Twitter
   *     summary: List twitter accounts
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
   *     responses:
   *       200:
   *         description: Paginated list of twitter accounts
   *         content:
   *           application/json:
   *             schema:
   *               $ref: "#/components/schemas/PaginatedTwitterAccounts"
   */
  async listAccounts(req: Request, res: Response) {
    const { page, pageSize } = parsePagination(req);
    const result = await this.listAccountsUseCase.execute({ page, pageSize });
    return ResponseBuilder.ok(res, result, "Twitter accounts retrieved");
  }

  /**
   * @openapi
   * /api/v1/twitter/accounts:
   *   post:
   *     tags:
   *       - Twitter
   *     summary: Create a twitter account
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: "#/components/schemas/TwitterAccount"
   *     responses:
   *       201:
   *         description: Created twitter account
   *         content:
   *           application/json:
   *             schema:
   *               $ref: "#/components/schemas/TwitterAccount"
   */
  async createAccount(req: Request, res: Response) {
    try {
      const account = await this.createAccountUseCase.execute(req.body);
      return ResponseBuilder.created(res, account, "Twitter account created");
    } catch (error) {
      return ResponseBuilder.badRequest(
        res,
        error instanceof Error ? error.message : "Invalid request"
      );
    }
  }

  /**
   * @openapi
   * /api/v1/twitter/accounts/{accountId}/follow:
   *   post:
   *     tags:
   *       - Twitter
   *     summary: Follow a twitter account
   *     parameters:
   *       - in: path
   *         name: accountId
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       202:
   *         description: Following account
   */
  async followAccount(req: Request, res: Response) {
    const userId = this.extractUserId(req);
    if (!userId) {
      return ResponseBuilder.unauthorized(res, "User context required");
    }

    try {
      await this.followUseCase.execute({
        userId,
        accountId: req.params.accountId,
      });
      return ResponseBuilder.accepted(res, null, "Following account");
    } catch (error) {
      return ResponseBuilder.badRequest(
        res,
        error instanceof Error ? error.message : "Invalid request"
      );
    }
  }

  /**
   * @openapi
   * /api/v1/twitter/accounts/{accountId}/follow:
   *   delete:
   *     tags:
   *       - Twitter
   *     summary: Unfollow a twitter account
   *     parameters:
   *       - in: path
   *         name: accountId
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       204:
   *         description: No content
   */
  async unfollowAccount(req: Request, res: Response) {
    const userId = this.extractUserId(req);
    if (!userId) {
      return ResponseBuilder.unauthorized(res, "User context required");
    }

    await this.unfollowUseCase.execute({
      userId,
      accountId: req.params.accountId,
    });
    return ResponseBuilder.noContent(res);
  }

  /**
   * @openapi
   * /api/v1/twitter/accounts/followed:
   *   get:
   *     tags:
   *       - Twitter
   *     summary: List followed twitter accounts
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
   *     responses:
   *       200:
   *         description: Paginated followed accounts retrieved
   *         content:
   *           application/json:
   *             schema:
   *               $ref: "#/components/schemas/PaginatedTwitterAccounts"
   */
  async listFollowedAccounts(req: Request, res: Response) {
    const userId = this.extractUserId(req);
    if (!userId) {
      return ResponseBuilder.unauthorized(res, "User context required");
    }

    const { page, pageSize } = parsePagination(req);
    const result = await this.listFollowedUseCase.execute({
      userId,
      page,
      pageSize,
    });
    return ResponseBuilder.ok(res, result, "Followed accounts retrieved");
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
   *       - in: query
   *         name: isMyFollowed
   *         schema:
   *           type: boolean
   *         description: When true, return tweets from followed accounts (requires auth)
   *       - in: query
   *         name: accountIds
   *         schema:
   *           type: string
   *         description: Comma-separated twitter account IDs
   *     responses:
   *       200:
   *         description: Paginated tweets retrieved
   *         content:
   *           application/json:
   *             schema:
   *               $ref: "#/components/schemas/PaginatedTweets"
   *       401:
   *         description: Authentication required for followed filter
   *         content:
   *           application/json:
   *             schema:
   *               $ref: "#/components/schemas/ErrorResponse"
   */

  async listTweets(req: Request, res: Response) {
    const { page, pageSize, accountIds, isMyFollowed, isPopular } =
      this.parseFilterQuery(req);

    try {
      const resolvedAccountIds = await this.resolveAccountIds(
        req,
        accountIds,
        isMyFollowed
      );

      if (isMyFollowed && resolvedAccountIds.length === 0) {
        return ResponseBuilder.ok(
          res,
          { items: [], total: 0, page, pageSize },
          "Tweets retrieved"
        );
      }

      const targetAccountIds =
        resolvedAccountIds.length > 0 ? resolvedAccountIds : undefined;

      const result = await this.listTweetsUseCase.execute({
        page,
        pageSize,
        isPopular,
        accountIds: targetAccountIds,
      });
      return ResponseBuilder.ok(res, result, "Tweets retrieved");
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
