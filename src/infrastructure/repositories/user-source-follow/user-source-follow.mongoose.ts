import { IUserSourceFollowRepository } from "../../../domain/repositories/user-source-follow.repository.interface";
import { UserSourceFollow } from "../../../domain/user-source-follow/user-source-follow";
import { UserSourceFollowMapper } from "../../persistence/mongoose/mappers/user-source-follow.mapper";
import { UserSourceFollowModel } from "../../persistence/mongoose/models/user-source-follow.model";

export class MongoUserSourceFollowRepository implements IUserSourceFollowRepository {
  async findByUserId(userId: string): Promise<UserSourceFollow[]> {
    const docs = await UserSourceFollowModel.find({ userId }).lean();
    return docs.map(UserSourceFollowMapper.toDomain);
  }

  async save(entity: UserSourceFollow): Promise<void> {
    const persistence = UserSourceFollowMapper.toPersistence(entity);
    await UserSourceFollowModel.findByIdAndUpdate(entity.id, persistence, {
      upsert: true,
    });
  }

  async delete(id: string): Promise<void> {
    await UserSourceFollowModel.findByIdAndDelete(id);
  }
}
