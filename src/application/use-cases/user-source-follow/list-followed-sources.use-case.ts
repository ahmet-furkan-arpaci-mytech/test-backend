import { inject, injectable } from "inversify";

import { IUserSourceFollowRepository } from "../../../domain/repositories/user-source-follow.repository.interface";
import { ISourceRepository } from "../../../domain/repositories/source.repository.interface";
import { DI_TYPES } from "../../../main/container/ioc.types.js";

export interface FollowedSourceInfo {
  id: string;
  name: string;
}

@injectable()
export class ListFollowedSourcesUseCase {
  constructor(
    @inject(DI_TYPES.UserSourceFollowRepository)
    private readonly repository: IUserSourceFollowRepository,
    @inject(DI_TYPES.SourceRepository)
    private readonly sourceRepository: ISourceRepository
  ) {}

  async execute(userId: string): Promise<FollowedSourceInfo[]> {
    const follows = await this.repository.findByUserId(userId);
    const sources = await Promise.all(
      follows.map((follow) => this.sourceRepository.findById(follow.sourceId))
    );

    return sources
      .filter(
        (source): source is NonNullable<typeof source> => Boolean(source)
      )
      .map((source) => ({
        id: source.id,
        name: source.name,
      }));
  }
}
