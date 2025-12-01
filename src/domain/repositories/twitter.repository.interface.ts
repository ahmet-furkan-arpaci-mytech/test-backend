import { PaginatedResult } from "../common/paginated-result";
import { Tweet } from "../twitter/tweet";
export interface TweetsFilter {
  isPopular?: boolean;
  accountIds?: string[];
}
export interface ITwitterRepository {
  findById(id: string): Promise<Tweet | null>;
  findAllPaginated(
    page: number,
    pageSize: number
  ): Promise<PaginatedResult<Tweet>>;
  findPopular(limit: number): Promise<Tweet[]>;
  findFilteredPaginated(
    filter: TweetsFilter,
    page: number,
    pageSize: number
  ): Promise<PaginatedResult<Tweet>>;
  save(entity: Tweet): Promise<void>;
  delete(id: string): Promise<void>;
}
