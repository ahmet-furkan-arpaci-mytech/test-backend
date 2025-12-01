import { PaginatedResult } from "../../../domain/common/paginated-result";
import {
  INewsRepository,
  NewsFilter,
} from "../../../domain/repositories/news.repository.interface";

import { News } from "../../../domain/news/news";
import { NewsMapper } from "../../persistence/mongoose/mappers/news.mapper";
import { NewsModel } from "../../persistence/mongoose/models/news.model";
import { injectable } from "inversify";

@injectable()
export class MongoNewsRepository implements INewsRepository {
  async findById(id: string): Promise<News | null> {
    const doc = await NewsModel.findById(id).lean();
    return doc ? NewsMapper.toDomain(doc) : null;
  }

  async findAll(): Promise<News[]> {
    const docs = await NewsModel.find().lean();
    return docs.map(NewsMapper.toDomain);
  }

  async findAllPaginated(
    page: number,
    pageSize: number
  ): Promise<PaginatedResult<News>> {
    return this.buildPaginatedResult({}, page, pageSize);
  }

  async findByCategoryId(categoryId: string): Promise<News[]> {
    const docs = await NewsModel.find({ categoryId }).lean();
    return docs.map(NewsMapper.toDomain);
  }

  async findByCategoryIdPaginated(
    categoryId: string,
    page: number,
    pageSize: number
  ): Promise<PaginatedResult<News>> {
    return this.buildPaginatedResult({ categoryId }, page, pageSize);
  }

  async findFilteredPaginated(
    filter: NewsFilter,
    page: number,
    pageSize: number
  ): Promise<PaginatedResult<News>> {
    const queryFilter = this.buildQueryFilter(filter);
    return this.buildPaginatedResult(queryFilter, page, pageSize);
  }

  async findBySourceIdsPaginated(
    sourceIds: string[],
    page: number,
    pageSize: number
  ): Promise<PaginatedResult<News>> {
    return this.buildPaginatedResult(
      { sourceId: { $in: sourceIds } },
      page,
      pageSize
    );
  }

  async save(entity: News): Promise<void> {
    const persistence = NewsMapper.toPersistence(entity);
    await NewsModel.findByIdAndUpdate(entity.id, persistence, {
      upsert: true,
    });
  }

  async update(entity: News): Promise<void> {
    const persistence = NewsMapper.toPersistence(entity);
    await NewsModel.findByIdAndUpdate(entity.id, persistence);
  }

  async delete(id: string): Promise<void> {
    await NewsModel.findByIdAndDelete(id);
  }

  private async buildPaginatedResult(
    filter: Record<string, any>,
    page: number,
    pageSize: number
  ): Promise<PaginatedResult<News>> {
    const normalizedPage = Math.max(1, page);
    const normalizedPageSize = Math.max(1, pageSize);
    const skip = (normalizedPage - 1) * normalizedPageSize;

    const [total, docs] = await Promise.all([
      NewsModel.countDocuments(filter),
      NewsModel.find(filter).skip(skip).limit(normalizedPageSize).lean(),
    ]);

    return {
      items: docs.map(NewsMapper.toDomain),
      total,
      page: normalizedPage,
      pageSize: normalizedPageSize,
    };
  }

  private buildQueryFilter(filter: NewsFilter): Record<string, any> {
    const queryFilter: Record<string, any> = {};
    if (filter.isLatest) {
      queryFilter.isLatest = true;
    }
    if (filter.isPopular) {
      queryFilter.isPopular = true;
    }
    if (filter.sourceIds && filter.sourceIds.length > 0) {
      queryFilter.sourceId = { $in: filter.sourceIds };
    }
    return queryFilter;
  }
}
