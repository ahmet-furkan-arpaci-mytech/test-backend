import { inject, injectable } from "inversify";

import { ITwitterAccountFollowRepository } from "../../../domain/repositories/twitter-account-follow.repository.interface";
import { DI_TYPES } from "../../../main/container/ioc.types.js";

export interface UnfollowTwitterAccountUseCaseInput {
  userId: string;
  accountId: string;
}

@injectable()
export class UnfollowTwitterAccountUseCase {
  constructor(
    @inject(DI_TYPES.TwitterAccountFollowRepository)
    private readonly followRepository: ITwitterAccountFollowRepository
  ) {}

  async execute(input: UnfollowTwitterAccountUseCaseInput): Promise<void> {
    const existing = await this.followRepository.findByUserIdAndAccountId(
      input.userId,
      input.accountId
    );
    if (!existing) {
      return;
    }

    await this.followRepository.delete(existing.id);
  }
}
