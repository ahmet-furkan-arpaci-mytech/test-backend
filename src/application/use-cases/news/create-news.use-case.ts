import { inject, injectable } from "inversify";

import { ICategoryRepository } from "../../../domain/repositories/category.repository.interface";
import { INewsRepository } from "../../../domain/repositories/news.repository.interface";
import { News } from "../../../domain/news/news";
import { DI_TYPES } from "../../../main/container/ioc.types.js";
import { IIdGenerator } from "../../services/id.service";

export interface CreateNewsUseCaseInput {
  title: string;
  content: string;
  imageUrl: string;
  categoryId: string;
  sourceId: string;
  publishedAt?: Date;
  isLatest?: boolean;
  isPopular?: boolean;
}

@injectable()
export class CreateNewsUseCase {
  constructor(
    @inject(DI_TYPES.NewsRepository)
    private readonly newsRepository: INewsRepository,
    @inject(DI_TYPES.CategoryRepository)
    private readonly categoryRepository: ICategoryRepository,
    @inject(DI_TYPES.IdGenerator)
    private readonly idGenerator: IIdGenerator
  ) {}

  async execute(input: CreateNewsUseCaseInput): Promise<News> {
    const category = await this.categoryRepository.findById(input.categoryId);
    if (!category) {
      throw new Error("Category does not exist.");
    }

    const news = News.create({
      id: this.idGenerator.generate(),
      title: input.title,
      content: input.content,
      imageUrl: input.imageUrl,
      categoryId: input.categoryId,
      sourceId: input.sourceId,
      publishedAt: input.publishedAt,
      isLatest: input.isLatest,
      isPopular: input.isPopular,
    });
    await this.newsRepository.save(news);
    return news;
  }
}
