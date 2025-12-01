import { inject, injectable } from "inversify";

import { PaginatedResult } from "../../../domain/common/paginated-result";
import { TwitterAccount } from "../../../domain/twitter-account/twitter-account";
import { ITwitterAccountFollowRepository } from "../../../domain/repositories/twitter-account-follow.repository.interface";
import { ITwitterAccountRepository } from "../../../domain/repositories/twitter-account.repository.interface";
import { DI_TYPES } from "../../../main/container/ioc.types.js";

export interface ListFollowedTwitterAccountsUseCaseInput {
  userId: string;
  page?: number;
  pageSize?: number;
}

@injectable()
export class ListFollowedTwitterAccountsUseCase {
  constructor(
    @inject(DI_TYPES.TwitterAccountFollowRepository)
    private readonly followRepository: ITwitterAccountFollowRepository,
    @inject(DI_TYPES.TwitterAccountRepository)
    private readonly accountRepository: ITwitterAccountRepository
  ) {}

  async execute(
    input: ListFollowedTwitterAccountsUseCaseInput
  ): Promise<PaginatedResult<TwitterAccount>> {
    const normalizedPage = Math.max(1, input.page ?? 1);
    const normalizedPageSize = Math.max(1, input.pageSize ?? 10);
    const skip = (normalizedPage - 1) * normalizedPageSize;

    const follows = await this.followRepository.findByUserId(input.userId);
    const accountPromises = follows.map((follow) =>
      this.accountRepository.findById(follow.accountId)
    );
    const accounts = (await Promise.all(accountPromises)).filter(
      Boolean
    ) as TwitterAccount[];

    const pagedItems = accounts.slice(skip, skip + normalizedPageSize);

    return {
      items: pagedItems,
      total: accounts.length,
      page: normalizedPage,
      pageSize: normalizedPageSize,
    };
  }
}
