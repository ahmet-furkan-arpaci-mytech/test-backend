import { User } from "../../../../domain/user/user";

export class UserMapper {
  static toDomain(raw: any): User {
    return User.create({
      id: raw._id,
      name: raw.name,
      imageUrl: raw.imageUrl,
      email: raw.email,
      password: raw.password,
    });
  }

  static toPersistence(entity: User) {
    return {
      _id: entity.id,
      name: entity.name,
      imageUrl: entity.imageUrl,
      email: entity.email,
      password: entity.password,
    };
  }
}
