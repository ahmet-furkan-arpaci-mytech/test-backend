import { SourceCategory } from "../../../../domain/source-category/source-category";

export class SourceCategoryMapper {
  static toDomain(raw: any): SourceCategory {
    return SourceCategory.create({
      id: raw._id,
      name: raw.name,
      description: raw.description,
    });
  }

  static toPersistence(entity: SourceCategory) {
    return {
      _id: entity.id,
      name: entity.name,
      description: entity.description,
    };
  }
}
