import { inject, injectable } from "inversify";

import { PaginatedResult } from "../../../domain/common/paginated-result";
import {
  INewsRepository,
  NewsFilter,
} from "../../../domain/repositories/news.repository.interface";
import { News } from "../../../domain/news/news";
import { DI_TYPES } from "../../../main/container/ioc.types.js";

export interface ListNewsUseCaseInput {
  page?: number;
  pageSize?: number;
  isLatest?: boolean;
  isPopular?: boolean;
  sourceIds?: string[];
}

@injectable()
export class ListNewsUseCase {
  constructor(
    @inject(DI_TYPES.NewsRepository)
    private readonly newsRepository: INewsRepository
  ) {}

  async execute(
    input: ListNewsUseCaseInput = {}
  ): Promise<PaginatedResult<News>> {
    const page = input.page ?? 1;
    const pageSize = input.pageSize ?? 10;

    const filter: NewsFilter = {};

    if (input.isLatest) {
      filter.isLatest = true;
    }

    if (input.isPopular) {
      filter.isPopular = true;
    }

    if (input.sourceIds && input.sourceIds.length > 0) {
      filter.sourceIds = input.sourceIds;
    }

    return this.newsRepository.findFilteredPaginated(filter, page, pageSize);
  }
}
