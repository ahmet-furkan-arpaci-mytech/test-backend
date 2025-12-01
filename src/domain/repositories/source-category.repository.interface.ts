import { SourceCategory } from "../source-category/source-category";

export interface ISourceCategoryRepository {
  findById(id: string): Promise<SourceCategory | null>;
  findAll(): Promise<SourceCategory[]>;
  save(entity: SourceCategory): Promise<void>;
  update(entity: SourceCategory): Promise<void>;
  delete(id: string): Promise<void>;
}
