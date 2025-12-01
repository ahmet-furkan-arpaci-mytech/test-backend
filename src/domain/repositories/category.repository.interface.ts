import { PaginatedResult } from "../common/paginated-result";
import { Category } from "../category/category";
import { CategoryWithNews } from "../category/category-with-news";
import { NewsFilter } from "./news.repository.interface";

export interface ICategoryRepository {
  findById(id: string): Promise<Category | null>;
  findByName(name: string): Promise<Category | null>;
  findAll(): Promise<Category[]>;
  findAllWithNews(
    filter: NewsFilter,
    page: number,
    pageSize: number
  ): Promise<PaginatedResult<CategoryWithNews>>;
  save(entity: Category): Promise<void>;
  update(entity: Category): Promise<void>;
  delete(id: string): Promise<void>;
}
