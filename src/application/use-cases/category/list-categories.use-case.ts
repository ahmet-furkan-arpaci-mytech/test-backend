import { inject, injectable } from "inversify";

import { Category } from "../../../domain/category/category";
import { ICategoryRepository } from "../../../domain/repositories/category.repository.interface";
import { DI_TYPES } from "../../../main/container/ioc.types.js";

@injectable()
export class ListCategoriesUseCase {
  constructor(
    @inject(DI_TYPES.CategoryRepository)
    private readonly categoryRepository: ICategoryRepository
  ) {}

  async execute(): Promise<Category[]> {
    return this.categoryRepository.findAll();
  }
}
