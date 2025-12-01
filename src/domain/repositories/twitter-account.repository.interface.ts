import { PaginatedResult } from "../common/paginated-result";
import { TwitterAccount } from "../twitter-account/twitter-account";

export interface ITwitterAccountRepository {
  findById(id: string): Promise<TwitterAccount | null>;
  findAllPaginated(page: number, pageSize: number): Promise<PaginatedResult<TwitterAccount>>;
  save(entity: TwitterAccount): Promise<void>;
  delete(id: string): Promise<void>;
}
