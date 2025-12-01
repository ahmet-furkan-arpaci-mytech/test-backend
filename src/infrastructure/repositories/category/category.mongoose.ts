import { Category } from "../../../domain/category/category";
import { CategoryMapper } from "../../persistence/mongoose/mappers/category.mapper";
import { CategoryModel } from "../../persistence/mongoose/models/category.model";
import { CategoryWithNews } from "../../../domain/category/category-with-news";
import { ICategoryRepository } from "../../../domain/repositories/category.repository.interface";
import { NewsFilter } from "../../../domain/repositories/news.repository.interface";
import { NewsMapper } from "../../persistence/mongoose/mappers/news.mapper";
import { PaginatedResult } from "../../../domain/common/paginated-result";
import type { PipelineStage } from "mongoose";
import { injectable } from "inversify";

@injectable()
export class MongoCategoryRepository implements ICategoryRepository {
  async findById(id: string): Promise<Category | null> {
    const doc = await CategoryModel.findById(id).lean();
    return doc ? CategoryMapper.toDomain(doc) : null;
  }

  async findByName(name: string): Promise<Category | null> {
    const doc = await CategoryModel.findOne({ name }).lean();
    return doc ? CategoryMapper.toDomain(doc) : null;
  }

  async findAll(): Promise<Category[]> {
    const docs = await CategoryModel.find().lean();
    return docs.map(CategoryMapper.toDomain);
  }

  async findAllWithNews(
    filter: NewsFilter,
    page: number,
    pageSize: number
  ): Promise<PaginatedResult<CategoryWithNews>> {
    const normalizedPage = Math.max(1, page);
    const normalizedPageSize = Math.max(1, pageSize);
    const skip = (normalizedPage - 1) * normalizedPageSize;

    const lookupPipeline: Exclude<
      PipelineStage,
      PipelineStage.Merge | PipelineStage.Out
    >[] = [
      { $match: this.buildNewsMatch(filter) } as PipelineStage.Match,
      {
        $lookup: {
          from: "sources",
          localField: "sourceId",
          foreignField: "_id",
          as: "source",
        },
      } as PipelineStage.Lookup,
      {
        $unwind: { path: "$source", preserveNullAndEmptyArrays: true },
      } as PipelineStage.Unwind,
      {
        $addFields: {
          sourceName: "$source.name",
          categoryName: "$$categoryName",
        },
      } as PipelineStage.AddFields,
      {
        $project: {
          source: 0,
        },
      } as PipelineStage.Project,
      { $sort: { publishedAt: -1 } } as PipelineStage.Sort,
    ];

    const lookupStage: PipelineStage.Lookup = {
      $lookup: {
        from: "news",
        let: { categoryId: "$_id", categoryName: "$name" },
        pipeline: lookupPipeline,
        as: "news",
      },
    };

    const [facetResult] = await CategoryModel.aggregate([
      { $sort: { name: 1 } },
      {
        $facet: {
          items: [
            { $skip: skip } as PipelineStage.Skip,
            { $limit: normalizedPageSize } as PipelineStage.Limit,
            lookupStage,
          ],
          total: [{ $count: "value" }],
        },
      },
    ]);

    const total = facetResult?.total?.[0]?.value ?? 0;
    const items = facetResult?.items ?? [];

    return {
      items: items.map((doc: any) => {
        const category = CategoryMapper.toDomain(doc);
        const newsItems = (doc.news ?? []).map(NewsMapper.toDomain);
        return new CategoryWithNews(category, newsItems);
      }),
      total,
      page: normalizedPage,
      pageSize: normalizedPageSize,
    };
  }

  async save(entity: Category): Promise<void> {
    const persistence = CategoryMapper.toPersistence(entity);
    await CategoryModel.findByIdAndUpdate(entity.id, persistence, {
      upsert: true,
    });
  }

  async update(entity: Category): Promise<void> {
    const persistence = CategoryMapper.toPersistence(entity);
    await CategoryModel.findByIdAndUpdate(entity.id, persistence);
  }

  async delete(id: string): Promise<void> {
    await CategoryModel.findByIdAndDelete(id);
  }

  private buildNewsMatch(filter: NewsFilter): Record<string, any> {
    const match: Record<string, any> = {
      $expr: { $eq: ["$categoryId", "$$categoryId"] },
    };
    if (filter.isLatest) {
      match.isLatest = true;
    }
    if (filter.isPopular) {
      match.isPopular = true;
    }
    if (filter.sourceIds && filter.sourceIds.length > 0) {
      match.sourceId = { $in: filter.sourceIds };
    }
    return match;
  }
}
