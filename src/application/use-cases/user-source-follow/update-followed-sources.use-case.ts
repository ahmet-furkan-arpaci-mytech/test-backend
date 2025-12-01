import { inject, injectable } from "inversify";

import { IUserSourceFollowRepository } from "../../../domain/repositories/user-source-follow.repository.interface";
import { UserSourceFollow } from "../../../domain/user-source-follow/user-source-follow";
import { DI_TYPES } from "../../../main/container/ioc.types.js";
import { IIdGenerator } from "../../services/id.service";

@injectable()
export class UpdateFollowedSourcesUseCase {
  constructor(
    @inject(DI_TYPES.UserSourceFollowRepository)
    private readonly repository: IUserSourceFollowRepository,
    @inject(DI_TYPES.IdGenerator)
    private readonly idGenerator: IIdGenerator
  ) {}

  async execute(userId: string, sourceIds: string[]): Promise<void> {
    const normalizedIds = Array.from(
      new Set(
        sourceIds
          .map((id) => (typeof id === "string" ? id.trim() : ""))
          .filter(Boolean)
      )
    );

    const currentFollows = await this.repository.findByUserId(userId);
    const currentMap = new Map(currentFollows.map((follow) => [follow.sourceId, follow]));

    const toRemove = currentFollows.filter(
      (follow) => !normalizedIds.includes(follow.sourceId)
    );
    await Promise.all(toRemove.map((follow) => this.repository.delete(follow.id)));

    const toAdd = normalizedIds.filter((sourceId) => !currentMap.has(sourceId));
    await Promise.all(
      toAdd.map((sourceId) =>
        this.repository.save(
          UserSourceFollow.create({
            id: this.idGenerator.generate(),
            userId,
            sourceId,
          })
        )
      )
    );
  }
}
