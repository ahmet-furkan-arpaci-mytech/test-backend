import { TwitterAccountFollow } from "../twitter-account-follow/twitter-account-follow";

export interface ITwitterAccountFollowRepository {
  findByUserId(userId: string): Promise<TwitterAccountFollow[]>;
  findByUserIdAndAccountId(userId: string, accountId: string): Promise<TwitterAccountFollow | null>;
  save(entity: TwitterAccountFollow): Promise<void>;
  delete(id: string): Promise<void>;
}
