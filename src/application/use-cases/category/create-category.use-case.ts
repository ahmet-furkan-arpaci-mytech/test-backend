import { inject, injectable } from "inversify";

import { Category } from "../../../domain/category/category";
import { ICategoryRepository } from "../../../domain/repositories/category.repository.interface";
import { DI_TYPES } from "../../../main/container/ioc.types.js";
import { IIdGenerator } from "../../services/id.service";

export interface CreateCategoryUseCaseInput {
  name: string;
  description: string;
  colorCode: string;
  imageUrl: string;
}

@injectable()
export class CreateCategoryUseCase {
  constructor(
    @inject(DI_TYPES.CategoryRepository)
    private readonly categoryRepository: ICategoryRepository,
    @inject(DI_TYPES.IdGenerator)
    private readonly idGenerator: IIdGenerator
  ) {}

  async execute(input: CreateCategoryUseCaseInput): Promise<Category> {
    const existing = await this.categoryRepository.findByName(input.name);
    if (existing) {
      throw new Error("Category with this name already exists.");
    }

    const category = Category.create({
      id: this.idGenerator.generate(),
      name: input.name,
      description: input.description,
      colorCode: input.colorCode,
      imageUrl: input.imageUrl,
    });
    await this.categoryRepository.save(category);
    return category;
  }
}
