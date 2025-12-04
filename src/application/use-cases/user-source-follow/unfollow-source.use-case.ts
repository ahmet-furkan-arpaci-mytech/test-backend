import { inject, injectable } from "inversify";

import { IUserSourceFollowRepository } from "../../../domain/repositories/user-source-follow.repository.interface";
import { DI_TYPES } from "../../../main/container/ioc.types.js";

@injectable()
export class UnfollowSourceUseCase {
  constructor(
    @inject(DI_TYPES.UserSourceFollowRepository)
    private readonly repository: IUserSourceFollowRepository
  ) {}

  async execute(userId: string, sourceId: string): Promise<void> {
    const normalizedSourceId = typeof sourceId === "string" ? sourceId.trim() : "";
    if (!normalizedSourceId) {
      throw new Error("sourceId is required");
    }

    const currentFollows = await this.repository.findByUserId(userId);
    const existingFollow = currentFollows.find(
      (follow) => follow.sourceId === normalizedSourceId
    );
    if (!existingFollow) {
      return;
    }

    await this.repository.delete(existingFollow.id);
  }
}
