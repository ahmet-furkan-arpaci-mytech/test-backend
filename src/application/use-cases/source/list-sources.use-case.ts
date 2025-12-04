import { inject, injectable } from "inversify";

import { ISourceRepository } from "../../../domain/repositories/source.repository.interface";
import { DI_TYPES } from "../../../main/container/ioc.types.js";

export interface SourceInfo {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  sourceCategoryId: string;
}

@injectable()
export class ListSourcesUseCase {
  constructor(
    @inject(DI_TYPES.SourceRepository)
    private readonly sourceRepository: ISourceRepository
  ) {}

  async execute(searchQuery?: string): Promise<SourceInfo[]> {
    const sources = await this.sourceRepository.findAll(searchQuery);
    return sources.map((source) => ({
      id: source.id,
      name: source.name,
      description: source.description,
      imageUrl: source.imageUrl,
      sourceCategoryId: source.sourceCategoryId,
    }));
  }
}
