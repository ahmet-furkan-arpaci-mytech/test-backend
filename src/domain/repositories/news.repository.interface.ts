import { News } from "../news/news";
import { PaginatedResult } from "../common/paginated-result";

export interface NewsFilter {
  isLatest?: boolean;
  isPopular?: boolean;
  sourceIds?: string[];
}

export interface INewsRepository {
  findById(id: string): Promise<News | null>;
  findAll(): Promise<News[]>;
  findAllPaginated(
    page: number,
    pageSize: number
  ): Promise<PaginatedResult<News>>;
  findByCategoryId(categoryId: string): Promise<News[]>;
  findByCategoryIdPaginated(
    categoryId: string,
    page: number,
    pageSize: number
  ): Promise<PaginatedResult<News>>;
  findFilteredPaginated(
    filter: NewsFilter,
    page: number,
    pageSize: number
  ): Promise<PaginatedResult<News>>;
  save(entity: News): Promise<void>;
  update(entity: News): Promise<void>;
  delete(id: string): Promise<void>;
}
