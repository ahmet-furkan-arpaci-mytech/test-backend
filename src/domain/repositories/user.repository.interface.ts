import { User } from "../user/user";

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findAll(): Promise<User[]>;
  save(entity: User): Promise<void>;
  update(entity: User): Promise<void>;
  delete(id: string): Promise<void>;
}
