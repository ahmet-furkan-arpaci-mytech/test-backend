import { ISavedNewsRepository } from "../../../domain/repositories/saved-news.repository.interface";
import { SavedNews } from "../../../domain/saved-news/saved-news";
import { SavedNewsMapper } from "../../persistence/mongoose/mappers/saved-news.mapper";
import { SavedNewsModel } from "../../persistence/mongoose/models/saved-news.model";

export class MongoSavedNewsRepository implements ISavedNewsRepository {
  async findById(id: string): Promise<SavedNews | null> {
    const doc = await SavedNewsModel.findById(id).lean();
    return doc ? SavedNewsMapper.toDomain(doc) : null;
  }

  async findByUserId(userId: string): Promise<SavedNews[]> {
    const docs = await SavedNewsModel.find({ userId }).lean();
    return docs.map(SavedNewsMapper.toDomain);
  }
  async findByNewsId(newsId: string): Promise<SavedNews | null> {
    const doc = await SavedNewsModel.findOne({ newsId }).lean();
    return doc ? SavedNewsMapper.toDomain(doc) : null;
  }

  async findByUserAndNews(
    userId: string,
    newsId: string
  ): Promise<SavedNews | null> {
    const doc = await SavedNewsModel.findOne({ userId, newsId }).lean();
    return doc ? SavedNewsMapper.toDomain(doc) : null;
  }

  async save(entity: SavedNews): Promise<void> {
    const persistence = SavedNewsMapper.toPersistence(entity);
    await SavedNewsModel.findByIdAndUpdate(entity.id, persistence, {
      upsert: true,
    });
  }

  async delete(newsId: string, userId: string): Promise<void> {
    await SavedNewsModel.findOneAndDelete({ newsId: newsId, userId: userId });
  }
}
