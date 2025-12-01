import { Source } from "../../../../domain/source/source";

export class SourceMapper {
  static toDomain(raw: any): Source {
    return Source.create({
      id: raw._id,
      name: raw.name,
      description: raw.description,
      imageUrl: raw.imageUrl,
      sourceCategoryId: raw.sourceCategoryId,
    });
  }

  static toPersistence(entity: Source) {
    return {
      _id: entity.id,
      name: entity.name,
      description: entity.description,
      imageUrl: entity.imageUrl,
      sourceCategoryId: entity.sourceCategoryId,
    };
  }
}
