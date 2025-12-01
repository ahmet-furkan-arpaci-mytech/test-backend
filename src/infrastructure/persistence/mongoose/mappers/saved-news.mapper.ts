import { SavedNews } from "../../../../domain/saved-news/saved-news";

export class SavedNewsMapper {
  static toDomain(raw: any): SavedNews {
    return SavedNews.create({
      id: raw._id,
      userId: raw.userId,
      newsId: raw.newsId,
      savedAt: raw.savedAt,
    });
  }

  static toPersistence(entity: SavedNews) {
    return {
      _id: entity.id,
      userId: entity.userId,
      newsId: entity.newsId,
      savedAt: entity.savedAt,
    };
  }
}
