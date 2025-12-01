import { ISourceCategoryRepository } from "../../../domain/repositories/source-category.repository.interface";
import { SourceCategory } from "../../../domain/source-category/source-category";
import { SourceCategoryMapper } from "../../persistence/mongoose/mappers/source-category.mapper";
import { SourceCategoryModel } from "../../persistence/mongoose/models/source-category.model";

export class MongoSourceCategoryRepository
  implements ISourceCategoryRepository
{
  async findById(id: string): Promise<SourceCategory | null> {
    const doc = await SourceCategoryModel.findById(id).lean();
    return doc ? SourceCategoryMapper.toDomain(doc) : null;
  }

  async findAll(): Promise<SourceCategory[]> {
    const docs = await SourceCategoryModel.find().lean();
    return docs.map(SourceCategoryMapper.toDomain);
  }

  async save(entity: SourceCategory): Promise<void> {
    const persistence = SourceCategoryMapper.toPersistence(entity);
    await SourceCategoryModel.findByIdAndUpdate(entity.id, persistence, {
      upsert: true,
    });
  }

  async update(entity: SourceCategory): Promise<void> {
    const persistence = SourceCategoryMapper.toPersistence(entity);
    await SourceCategoryModel.findByIdAndUpdate(entity.id, persistence);
  }

  async delete(id: string): Promise<void> {
    await SourceCategoryModel.findByIdAndDelete(id);
  }
}
