import { inject, injectable } from "inversify";

import { IUserSourceFollowRepository } from "../../../domain/repositories/user-source-follow.repository.interface";
import { DI_TYPES } from "../../../main/container/ioc.types.js";

@injectable()
export class RemoveAllFollowedSourcesUseCase {
  constructor(
    @inject(DI_TYPES.UserSourceFollowRepository)
    private readonly repository: IUserSourceFollowRepository
  ) {}

  async execute(userId: string): Promise<void> {
    const follows = await this.repository.findByUserId(userId);
    await Promise.all(follows.map((follow) => this.repository.delete(follow.id)));
  }
}
