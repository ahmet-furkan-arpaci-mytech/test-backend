import { Category } from "../../../domain/category/category";
import { CategoryMapper } from "../../persistence/mongoose/mappers/category.mapper";
import { CategoryModel } from "../../persistence/mongoose/models/category.model";
import { CategoryWithNews } from "../../../domain/category/category-with-news";
import { ICategoryRepository } from "../../../domain/repositories/category.repository.interface";
import { News } from "../../../domain/news/news";
import { NewsFilter } from "../../../domain/repositories/news.repository.interface";
import { NewsMapper } from "../../persistence/mongoose/mappers/news.mapper";
import { NewsModel } from "../../persistence/mongoose/models/news.model";
import { PaginatedResult } from "../../../domain/common/paginated-result";
import { attachSourceMetadata } from "../../persistence/mongoose/utils/source-metadata";
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

    const categories = await CategoryModel.find().sort({ name: 1 }).lean();
    const categoryMap = new Map<string, Category>();
    categories.forEach((doc) => {
      categoryMap.set(doc._id, CategoryMapper.toDomain(doc));
    });
    const normalizedCategories = categories;

    const newsFilter = this.buildNewsFilter(filter);
    const startIndex = skip;
    const endIndex = skip + normalizedPageSize;

    const [total, newsDocs] = await Promise.all([
      NewsModel.countDocuments(newsFilter),
      NewsModel.aggregate([
        { $match: newsFilter },
        {
          $setWindowFields: {
            partitionBy: "$categoryId",
            sortBy: { publishedAt: -1 },
            output: {
              rowNumber: { $documentNumber: {} },
            },
          },
        },
        {
          $match: {
            rowNumber: { $gt: startIndex, $lte: endIndex },
          },
        },
        { $sort: { categoryId: 1, publishedAt: -1 } },
      ]),
    ]);

    const enrichedNewsDocs = await attachSourceMetadata(newsDocs);

    const newsByCategory = new Map<string, News[]>();
    enrichedNewsDocs.forEach((doc: any) => {
      const categoryId: string | undefined = doc.categoryId;
      if (!categoryId) {
        return;
      }
      const newsItem = NewsMapper.toDomain({
        ...doc,
        categoryName: categoryMap.get(categoryId)?.name,
      });
      const existing = newsByCategory.get(categoryId);
      if (existing) {
        existing.push(newsItem);
      } else {
        newsByCategory.set(categoryId, [newsItem]);
      }
    });

    const items = normalizedCategories.map((catDoc) => {
      const category =
        categoryMap.get(catDoc._id) ?? CategoryMapper.toDomain(catDoc);
      const newsList = newsByCategory.get(catDoc._id) ?? [];
      return new CategoryWithNews(category, newsList);
    });

    return {
      items,
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

  private buildNewsFilter(filter: NewsFilter): Record<string, any> {
    const query: Record<string, any> = {};
    if (filter.isLatest) {
      query.isLatest = true;
    }
    if (filter.isPopular) {
      query.isPopular = true;
    }
    if (filter.sourceIds && filter.sourceIds.length > 0) {
      query.sourceId = { $in: filter.sourceIds };
    }
    return query;
  }
}
