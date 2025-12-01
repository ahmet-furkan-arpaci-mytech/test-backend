import { UserSourceFollow } from "../user-source-follow/user-source-follow";

export interface IUserSourceFollowRepository {
  findByUserId(userId: string): Promise<UserSourceFollow[]>;
  save(entity: UserSourceFollow): Promise<void>;
  delete(id: string): Promise<void>;
}
