import { inject, injectable } from "inversify";

import { ICategoryRepository } from "../../../domain/repositories/category.repository.interface";
import { ISourceRepository } from "../../../domain/repositories/source.repository.interface";
import { DI_TYPES } from "../../../main/container/ioc.types.js";
import { SourceInfo } from "./list-sources.use-case.js";

@injectable()
export class ListSourcesByCategoryUseCase {
  constructor(
    @inject(DI_TYPES.SourceRepository)
    private readonly sourceRepository: ISourceRepository,
    @inject(DI_TYPES.CategoryRepository)
    private readonly categoryRepository: ICategoryRepository
  ) {}

  async execute(categoryId: string): Promise<SourceInfo[]> {
    const normalizedCategoryId =
      typeof categoryId === "string" ? categoryId.trim() : "";
    if (!normalizedCategoryId) {
      throw new Error("categoryId is required");
    }

    const [sources, category] = await Promise.all([
      this.sourceRepository.findByCategoryId(normalizedCategoryId),
      this.categoryRepository.findById(normalizedCategoryId),
    ]);
    return sources.map((source) => ({
      id: source.id,
      name: source.name,
      description: source.description,
      imageUrl: source.imageUrl,
      sourceCategoryId: source.sourceCategoryId,
      sourceCategoryTitle: category?.name,
    }));
  }
}
