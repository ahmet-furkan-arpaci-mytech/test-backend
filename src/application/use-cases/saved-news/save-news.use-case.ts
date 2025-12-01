import { inject, injectable } from "inversify";

import { IUserRepository } from "../../../domain/repositories/user.repository.interface";
import { INewsRepository } from "../../../domain/repositories/news.repository.interface";
import { ISavedNewsRepository } from "../../../domain/repositories/saved-news.repository.interface";
import { SavedNews } from "../../../domain/saved-news/saved-news";
import { DI_TYPES } from "../../../main/container/ioc.types.js";
import { IIdGenerator } from "../../services/id.service";

export interface SaveNewsUseCaseInput {
  userId: string;
  newsId: string;
}

@injectable()
export class SaveNewsUseCase {
  constructor(
    @inject(DI_TYPES.SavedNewsRepository)
    private readonly savedNewsRepository: ISavedNewsRepository,
    @inject(DI_TYPES.UserRepository)
    private readonly userRepository: IUserRepository,
    @inject(DI_TYPES.NewsRepository)
    private readonly newsRepository: INewsRepository,
    @inject(DI_TYPES.IdGenerator)
    private readonly idGenerator: IIdGenerator
  ) {}

  async execute(input: SaveNewsUseCaseInput): Promise<SavedNews> {
    const user = await this.userRepository.findById(input.userId);
    if (!user) {
      throw new Error("User not found.");
    }

    const news = await this.newsRepository.findById(input.newsId);
    if (!news) {
      throw new Error("News not found.");
    }

    const existing = await this.savedNewsRepository.findByUserAndNews(
      input.userId,
      input.newsId
    );
    if (existing) {
      throw new Error("News already saved for this user.");
    }

    const savedNews = SavedNews.create({
      id: this.idGenerator.generate(),
      userId: input.userId,
      newsId: input.newsId,
    });

    await this.savedNewsRepository.save(savedNews);
    return savedNews;
  }
}
