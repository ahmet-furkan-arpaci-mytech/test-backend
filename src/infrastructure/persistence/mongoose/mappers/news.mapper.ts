import { News } from "../../../../domain/news/news";

export class NewsMapper {
  static toDomain(raw: any): News {
    return News.create({
      id: raw._id,
      title: raw.title,
      content: raw.content,
      imageUrl: raw.imageUrl,
      categoryId: raw.categoryId,
      sourceId: raw.sourceId,
      publishedAt: raw.publishedAt,
      isLatest: raw.isLatest,
      isPopular: raw.isPopular,
      sourceName: raw.sourceName,
      categoryName: raw.categoryName,
    });
  }

  static toPersistence(entity: News) {
    return {
    _id: entity.id,
    title: entity.title,
    content: entity.content,
    imageUrl: entity.imageUrl,
    categoryId: entity.categoryId,
    sourceId: entity.sourceId,
    publishedAt: entity.publishedAt,
    isLatest: entity.isLatest,
    isPopular: entity.isPopular,
    };
  }
}
