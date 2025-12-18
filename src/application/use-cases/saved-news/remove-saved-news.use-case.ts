import { inject, injectable } from "inversify";

import { ISavedNewsRepository } from "../../../domain/repositories/saved-news.repository.interface";
import { DI_TYPES } from "../../../main/container/ioc.types.js";
import { AppError } from "../../exceptions/app-error.js";

export interface RemoveSavedNewsUseCaseInput {
  userId: string;
  newsId: string;
}

@injectable()
export class RemoveSavedNewsUseCase {
  constructor(
    @inject(DI_TYPES.SavedNewsRepository)
    private readonly savedNewsRepository: ISavedNewsRepository
  ) {}

  async execute(input: RemoveSavedNewsUseCaseInput): Promise<void> {
    const savedNews = await this.savedNewsRepository.findByUserAndNews(
      input.userId,
      input.newsId
    );
    if (!savedNews) {
      throw new AppError("Saved news not found", 404);
    }

    await this.savedNewsRepository.delete(input.newsId, input.userId);
  }
}
