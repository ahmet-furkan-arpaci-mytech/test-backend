import { ITwitterAccountFollowRepository } from "../../../domain/repositories/twitter-account-follow.repository.interface";
import { TwitterAccountFollow } from "../../../domain/twitter-account-follow/twitter-account-follow";
import { TwitterAccountFollowMapper } from "../../persistence/mongoose/mappers/twitter-account-follow.mapper";
import { TwitterAccountFollowModel } from "../../persistence/mongoose/models/twitter-account-follow.model";

export class MongoTwitterAccountFollowRepository
  implements ITwitterAccountFollowRepository
{
  async findByUserId(userId: string): Promise<TwitterAccountFollow[]> {
    const docs = await TwitterAccountFollowModel.find({ userId }).lean();
    return docs.map(TwitterAccountFollowMapper.toDomain);
  }

  async findByUserIdAndAccountId(
    userId: string,
    accountId: string
  ): Promise<TwitterAccountFollow | null> {
    const doc = await TwitterAccountFollowModel.findOne({ userId, accountId }).lean();
    return doc ? TwitterAccountFollowMapper.toDomain(doc) : null;
  }

  async save(entity: TwitterAccountFollow): Promise<void> {
    const persistence = TwitterAccountFollowMapper.toPersistence(entity);
    await TwitterAccountFollowModel.findByIdAndUpdate(entity.id, persistence, {
      upsert: true,
    });
  }

  async delete(id: string): Promise<void> {
    await TwitterAccountFollowModel.findByIdAndDelete(id);
  }
}
