import { inject, injectable } from "inversify";

import { ISavedNewsRepository } from "../../../domain/repositories/saved-news.repository.interface";
import { DI_TYPES } from "../../../main/container/ioc.types.js";

export interface RemoveSavedNewsUseCaseInput {
  userId: string;
  savedNewsId: string;
}

@injectable()
export class RemoveSavedNewsUseCase {
  constructor(
    @inject(DI_TYPES.SavedNewsRepository)
    private readonly savedNewsRepository: ISavedNewsRepository
  ) {}

  async execute(input: RemoveSavedNewsUseCaseInput): Promise<void> {
    const savedNews = await this.savedNewsRepository.findById(input.savedNewsId);
    if (!savedNews || savedNews.userId !== input.userId) {
      throw new Error("Saved news not found.");
    }

    await this.savedNewsRepository.delete(input.savedNewsId);
  }
}
