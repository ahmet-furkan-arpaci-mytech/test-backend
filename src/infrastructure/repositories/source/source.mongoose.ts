import { ISourceRepository } from "../../../domain/repositories/source.repository.interface";
import { Source } from "../../../domain/source/source";
import { SourceMapper } from "../../persistence/mongoose/mappers/source.mapper";
import { SourceModel } from "../../persistence/mongoose/models/source.model";

export class MongoSourceRepository implements ISourceRepository {
  async findById(id: string): Promise<Source | null> {
    const doc = await SourceModel.findById(id).lean();
    return doc ? SourceMapper.toDomain(doc) : null;
  }

  async findAll(searchQuery?: string): Promise<Source[]> {
    const query: Record<string, unknown> = {};
    if (searchQuery?.trim()) {
      const regex = new RegExp(searchQuery.trim(), "i");
      query.name = regex;
    }

    const docs = await SourceModel.find(query).lean();
    return docs.map(SourceMapper.toDomain);
  }

  async save(entity: Source): Promise<void> {
    const persistence = SourceMapper.toPersistence(entity);
    await SourceModel.findByIdAndUpdate(entity.id, persistence, {
      upsert: true,
    });
  }
  async update(entity: Source): Promise<void> {
    const persistence = SourceMapper.toPersistence(entity);
    await SourceModel.findByIdAndUpdate(entity.id, persistence);
  }

  async delete(id: string): Promise<void> {
    await SourceModel.findByIdAndDelete(id);
  }
}
