import { inject, injectable } from "inversify";

import { PaginatedResult } from "../../../domain/common/paginated-result";
import { INewsRepository } from "../../../domain/repositories/news.repository.interface";
import { News } from "../../../domain/news/news";
import { DI_TYPES } from "../../../main/container/ioc.types.js";

export interface GetNewsByCategoryUseCaseInput {
  categoryId: string;
  page?: number;
  pageSize?: number;
}

@injectable()
export class GetNewsByCategoryUseCase {
  constructor(
    @inject(DI_TYPES.NewsRepository)
    private readonly newsRepository: INewsRepository
  ) {}

  async execute(
    input: GetNewsByCategoryUseCaseInput
  ): Promise<PaginatedResult<News>> {
    const page = input.page ?? 1;
    const pageSize = input.pageSize ?? 10;
    return this.newsRepository.findByCategoryIdPaginated(
      input.categoryId,
      page,
      pageSize
    );
  }
}
