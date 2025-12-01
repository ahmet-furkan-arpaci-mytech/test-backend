import {
  ITwitterRepository,
  TweetsFilter,
} from "../../../domain/repositories/twitter.repository.interface";

import { PaginatedResult } from "../../../domain/common/paginated-result";
import { Tweet } from "../../../domain/twitter/tweet";
import { TweetMapper } from "../../persistence/mongoose/mappers/tweet.mapper";
import { TweetModel } from "../../persistence/mongoose/models/tweet.model";
import { injectable } from "inversify";

@injectable()
export class MongoTwitterRepository implements ITwitterRepository {
  async findById(id: string): Promise<Tweet | null> {
    const doc = await TweetModel.findById(id).lean();
    return doc ? TweetMapper.toDomain(doc) : null;
  }

  async findAllPaginated(
    page: number,
    pageSize: number
  ): Promise<PaginatedResult<Tweet>> {
    return this.buildPaginatedResult({}, page, pageSize);
  }

  async findPopular(limit: number): Promise<Tweet[]> {
    const docs = await TweetModel.find({ isPopular: true })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    return docs.map(TweetMapper.toDomain);
  }

  async save(entity: Tweet): Promise<void> {
    const persistence = TweetMapper.toPersistence(entity);
    await TweetModel.findByIdAndUpdate(entity.id, persistence, {
      upsert: true,
    });
  }

  async delete(id: string): Promise<void> {
    await TweetModel.findByIdAndDelete(id);
  }

  private async buildPaginatedResult(
    filter: Record<string, any>,
    page: number,
    pageSize: number
  ): Promise<PaginatedResult<Tweet>> {
    const normalizedPage = Math.max(1, page);
    const normalizedPageSize = Math.max(1, pageSize);
    const skip = (normalizedPage - 1) * normalizedPageSize;

    const [total, docs] = await Promise.all([
      TweetModel.countDocuments(filter),
      TweetModel.find(filter).skip(skip).limit(normalizedPageSize).lean(),
    ]);

    return {
      items: docs.map(TweetMapper.toDomain),
      total,
      page: normalizedPage,
      pageSize: normalizedPageSize,
    };
  }

  async findFilteredPaginated(
    filter: TweetsFilter,
    page: number,
    pageSize: number
  ): Promise<PaginatedResult<Tweet>> {
    const queryFilter = this.buildQueryFilter(filter);
    return this.buildPaginatedResult(queryFilter, page, pageSize);
  }

  private buildQueryFilter(filter: TweetsFilter): Record<string, any> {
    const queryFilter: Record<string, any> = {};
    if (filter.isPopular) {
      queryFilter.isPopular = true;
    }
    if (filter.accountIds && filter.accountIds.length > 0) {
      queryFilter.accountId = { $in: filter.accountIds };
    }
    return queryFilter;
  }
}
