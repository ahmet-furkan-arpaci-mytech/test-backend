import { Source } from "../source/source";

export interface ISourceRepository {
  findById(id: string): Promise<Source | null>;
  findAll(searchQuery?: string): Promise<Source[]>;
  findByCategoryId(categoryId: string): Promise<Source[]>;
  save(entity: Source): Promise<void>;
  update(entity: Source): Promise<void>;
  delete(id: string): Promise<void>;
}
