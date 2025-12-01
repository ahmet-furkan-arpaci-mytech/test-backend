import { inject, injectable } from "inversify";

import { PaginatedResult } from "../../../domain/common/paginated-result";
import { CategoryWithNews } from "../../../domain/category/category-with-news";
import { ICategoryRepository } from "../../../domain/repositories/category.repository.interface";
import { NewsFilter } from "../../../domain/repositories/news.repository.interface";
import { DI_TYPES } from "../../../main/container/ioc.types.js";

export interface ListCategoriesWithNewsUseCaseInput {
  page?: number;
  pageSize?: number;
  isLatest?: boolean;
  isPopular?: boolean;
  sourceIds?: string[];
}

@injectable()
export class ListCategoriesWithNewsUseCase {
  constructor(
    @inject(DI_TYPES.CategoryRepository)
    private readonly categoryRepository: ICategoryRepository
  ) {}

  async execute(
    input: ListCategoriesWithNewsUseCaseInput = {}
  ): Promise<PaginatedResult<CategoryWithNews>> {
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

    return this.categoryRepository.findAllWithNews(filter, page, pageSize);
  }
}
