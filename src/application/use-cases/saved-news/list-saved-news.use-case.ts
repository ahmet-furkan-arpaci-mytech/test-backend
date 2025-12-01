import { inject, injectable } from "inversify";

import { ISavedNewsRepository } from "../../../domain/repositories/saved-news.repository.interface";
import { DI_TYPES } from "../../../main/container/ioc.types.js";

@injectable()
export class ListSavedNewsUseCase {
  constructor(
    @inject(DI_TYPES.SavedNewsRepository)
    private readonly savedNewsRepository: ISavedNewsRepository
  ) {}

  async execute(userId: string) {
    return this.savedNewsRepository.findByUserId(userId);
  }
}
