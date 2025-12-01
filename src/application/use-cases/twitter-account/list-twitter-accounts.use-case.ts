import { inject, injectable } from "inversify";

import { ITwitterAccountRepository } from "../../../domain/repositories/twitter-account.repository.interface";
import { PaginatedResult } from "../../../domain/common/paginated-result";
import { TwitterAccount } from "../../../domain/twitter-account/twitter-account";
import { DI_TYPES } from "../../../main/container/ioc.types.js";

export interface ListTwitterAccountsUseCaseInput {
  page?: number;
  pageSize?: number;
}

@injectable()
export class ListTwitterAccountsUseCase {
  constructor(
    @inject(DI_TYPES.TwitterAccountRepository)
    private readonly repository: ITwitterAccountRepository
  ) {}

  async execute(
    input: ListTwitterAccountsUseCaseInput = {}
  ): Promise<PaginatedResult<TwitterAccount>> {
    const page = input.page ?? 1;
    const pageSize = input.pageSize ?? 10;
    return this.repository.findAllPaginated(page, pageSize);
  }
}
