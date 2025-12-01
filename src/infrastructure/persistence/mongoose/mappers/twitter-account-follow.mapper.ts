import { TwitterAccountFollow } from "../../../../domain/twitter-account-follow/twitter-account-follow";

export class TwitterAccountFollowMapper {
  static toDomain(raw: any): TwitterAccountFollow {
    return TwitterAccountFollow.create({
      id: raw._id,
      userId: raw.userId,
      accountId: raw.accountId,
    });
  }

  static toPersistence(entity: TwitterAccountFollow) {
    return {
      _id: entity.id,
      userId: entity.userId,
      accountId: entity.accountId,
    };
  }
}
