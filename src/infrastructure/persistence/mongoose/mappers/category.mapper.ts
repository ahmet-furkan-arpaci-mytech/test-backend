import { Category } from "../../../../domain/category/category";

export class CategoryMapper {
  static toDomain(raw: any): Category {
    return Category.create({
      id: raw._id,
      name: raw.name,
      description: raw.description,
      colorCode: raw.colorCode,
      imageUrl: raw.imageUrl,
    });
  }

  static toPersistence(entity: Category) {
    return {
      _id: entity.id,
      name: entity.name,
      description: entity.description,
      colorCode: entity.colorCode,
      imageUrl: entity.imageUrl,
    };
  }
}
