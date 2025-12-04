import { inject, injectable } from "inversify";

import { IUserSourceFollowRepository } from "../../../domain/repositories/user-source-follow.repository.interface";
import { UserSourceFollow } from "../../../domain/user-source-follow/user-source-follow";
import { DI_TYPES } from "../../../main/container/ioc.types.js";
import { IIdGenerator } from "../../services/id.service";

@injectable()
export class FollowSourceUseCase {
  constructor(
    @inject(DI_TYPES.UserSourceFollowRepository)
    private readonly repository: IUserSourceFollowRepository,
    @inject(DI_TYPES.IdGenerator)
    private readonly idGenerator: IIdGenerator
  ) {}

  async execute(userId: string, sourceId: string): Promise<void> {
    const normalizedSourceId = typeof sourceId === "string" ? sourceId.trim() : "";
    if (!normalizedSourceId) {
      throw new Error("sourceId is required");
    }

    const currentFollows = await this.repository.findByUserId(userId);
    const alreadyFollowing = currentFollows.some(
      (follow) => follow.sourceId === normalizedSourceId
    );
    if (alreadyFollowing) {
      return;
    }

    await this.repository.save(
      UserSourceFollow.create({
        id: this.idGenerator.generate(),
        userId,
        sourceId: normalizedSourceId,
      })
    );
  }
}
