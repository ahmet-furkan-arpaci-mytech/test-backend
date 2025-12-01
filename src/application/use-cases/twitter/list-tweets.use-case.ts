import {
  ITwitterRepository,
  TweetsFilter,
} from "../../../domain/repositories/twitter.repository.interface";

import { PaginatedResult } from "../../../domain/common/paginated-result";
import { Tweet } from "../../../domain/twitter/tweet";
import { inject, injectable } from "inversify";
import { DI_TYPES } from "../../../main/container/ioc.types";

export interface ListTweetsUseCaseInput {
  page?: number;
  pageSize?: number;
  isPopular?: boolean;
  accountIds?: string[];
}
@injectable()
export class ListTweetsUseCase {
  constructor(
    @inject(DI_TYPES.TwitterRepository)
    private readonly repository: ITwitterRepository
  ) {}

  async execute(
    input: ListTweetsUseCaseInput = {}
  ): Promise<PaginatedResult<Tweet>> {
    const page = input.page ?? 1;
    const pageSize = input.pageSize ?? 10;

    const filter: TweetsFilter = {};

    if (input.isPopular) {
      filter.isPopular = true;
    }

    if (input.accountIds && input.accountIds.length > 0) {
      filter.accountIds = input.accountIds;
    }

    return this.repository.findFilteredPaginated(filter, page, pageSize);
  }
}
