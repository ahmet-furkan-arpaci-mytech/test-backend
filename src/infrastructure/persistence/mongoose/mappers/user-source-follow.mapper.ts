import { UserSourceFollow } from "../../../../domain/user-source-follow/user-source-follow";

export class UserSourceFollowMapper {
  static toDomain(raw: any): UserSourceFollow {
    return UserSourceFollow.create({
      id: raw._id,
      userId: raw.userId,
      sourceId: raw.sourceId,
    });
  }

  static toPersistence(entity: UserSourceFollow) {
    return {
      _id: entity.id,
      userId: entity.userId,
      sourceId: entity.sourceId,
    };
  }
}
