import { Tweet } from "../../../../domain/twitter/tweet";

export class TweetMapper {
  static toDomain(raw: any): Tweet {
    return Tweet.create({
      id: raw._id,
      accountId: raw.accountId,
      accountName: raw.accountName,
      accountImageUrl: raw.accountImageUrl,
      content: raw.content,
      createdAt: raw.createdAt,
      isPopular: raw.isPopular,
    });
  }

  static toPersistence(entity: Tweet) {
    return {
      _id: entity.id,
      accountId: entity.accountId,
      accountName: entity.accountName,
      accountImageUrl: entity.accountImageUrl,
      content: entity.content,
      createdAt: entity.createdAt,
      isPopular: entity.isPopular,
    };
  }
}
