import { TwitterAccount } from "../../../../domain/twitter-account/twitter-account";

export class TwitterAccountMapper {
  static toDomain(raw: any): TwitterAccount {
    return TwitterAccount.create({
      id: raw._id,
      handle: raw.handle,
      displayName: raw.displayName,
      imageUrl: raw.imageUrl,
      bio: raw.bio,
      createdAt: raw.createdAt,
    });
  }

  static toPersistence(entity: TwitterAccount) {
    return {
      _id: entity.id,
      handle: entity.handle,
      displayName: entity.displayName,
      imageUrl: entity.imageUrl,
      bio: entity.bio,
      createdAt: entity.createdAt,
    };
  }
}
