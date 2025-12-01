import { PaginatedResult } from "../../../domain/common/paginated-result";
import { ITwitterAccountRepository } from "../../../domain/repositories/twitter-account.repository.interface";
import { TwitterAccount } from "../../../domain/twitter-account/twitter-account";
import { TwitterAccountMapper } from "../../persistence/mongoose/mappers/twitter-account.mapper";
import { TwitterAccountModel } from "../../persistence/mongoose/models/twitter-account.model";

export class MongoTwitterAccountRepository implements ITwitterAccountRepository {
  async findById(id: string): Promise<TwitterAccount | null> {
    const doc = await TwitterAccountModel.findById(id).lean();
    return doc ? TwitterAccountMapper.toDomain(doc) : null;
  }

  async findAllPaginated(
    page: number,
    pageSize: number
  ): Promise<PaginatedResult<TwitterAccount>> {
    return this.buildPaginatedResult({}, page, pageSize);
  }

  async save(entity: TwitterAccount): Promise<void> {
    const persistence = TwitterAccountMapper.toPersistence(entity);
    await TwitterAccountModel.findByIdAndUpdate(entity.id, persistence, {
      upsert: true,
    });
  }

  async delete(id: string): Promise<void> {
    await TwitterAccountModel.findByIdAndDelete(id);
  }

  private async buildPaginatedResult(
    filter: Record<string, any>,
    page: number,
    pageSize: number
  ): Promise<PaginatedResult<TwitterAccount>> {
    const normalizedPage = Math.max(1, page);
    const normalizedPageSize = Math.max(1, pageSize);
    const skip = (normalizedPage - 1) * normalizedPageSize;

    const [total, docs] = await Promise.all([
      TwitterAccountModel.countDocuments(filter),
      TwitterAccountModel.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(normalizedPageSize)
        .lean(),
    ]);

    return {
      items: docs.map(TwitterAccountMapper.toDomain),
      total,
      page: normalizedPage,
      pageSize: normalizedPageSize,
    };
  }
}
