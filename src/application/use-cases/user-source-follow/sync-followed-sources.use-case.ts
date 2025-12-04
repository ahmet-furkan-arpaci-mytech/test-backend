import { inject, injectable } from "inversify";

import { IUserSourceFollowRepository } from "../../../domain/repositories/user-source-follow.repository.interface";
import { UserSourceFollow } from "../../../domain/user-source-follow/user-source-follow";
import { DI_TYPES } from "../../../main/container/ioc.types.js";
import { IIdGenerator } from "../../services/id.service";

export type FollowStateUpdate = {
  sourceId: string;
  isFollowed: boolean;
};

export type SyncFollowedSourcesResult = {
  followed: string[];
  unfollowed: string[];
};

@injectable()
export class SyncFollowedSourcesUseCase {
  constructor(
    @inject(DI_TYPES.UserSourceFollowRepository)
    private readonly repository: IUserSourceFollowRepository,
    @inject(DI_TYPES.IdGenerator)
    private readonly idGenerator: IIdGenerator
  ) {}

  async execute(
    userId: string,
    updates: FollowStateUpdate[]
  ): Promise<SyncFollowedSourcesResult> {
    const normalized: Map<string, boolean> = new Map();
    updates.forEach((update) => {
      const trimmed = typeof update.sourceId === "string" ? update.sourceId.trim() : "";
      if (!trimmed || typeof update.isFollowed !== "boolean") {
        return;
      }
      normalized.set(trimmed, update.isFollowed);
    });

    if (normalized.size === 0) {
      return {
        followed: [],
        unfollowed: [],
      };
    }

    const currentFollows = await this.repository.findByUserId(userId);
    const currentMap = new Map(currentFollows.map((follow) => [follow.sourceId, follow]));

    const toFollow: string[] = [];
    const toUnfollow: { id: string; sourceId: string }[] = [];

    normalized.forEach((shouldFollow, sourceId) => {
      const existing = currentMap.get(sourceId);
      if (shouldFollow) {
        if (!existing) {
          toFollow.push(sourceId);
        }
        return;
      }
      if (existing) {
        toUnfollow.push({ id: existing.id, sourceId });
      }
    });

    await Promise.all(
      toFollow.map((sourceId) =>
        this.repository.save(
          UserSourceFollow.create({
            id: this.idGenerator.generate(),
            userId,
            sourceId,
          })
        )
      )
    );
    await Promise.all(toUnfollow.map((item) => this.repository.delete(item.id)));
    return {
      followed: toFollow,
      unfollowed: toUnfollow.map((item) => item.sourceId),
    };
  }
}
