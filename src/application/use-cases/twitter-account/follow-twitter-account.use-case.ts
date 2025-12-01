import { inject, injectable } from "inversify";

import { ITwitterAccountFollowRepository } from "../../../domain/repositories/twitter-account-follow.repository.interface";
import { ITwitterAccountRepository } from "../../../domain/repositories/twitter-account.repository.interface";
import { TwitterAccountFollow } from "../../../domain/twitter-account-follow/twitter-account-follow";
import { IIdGenerator } from "../../services/id.service";
import { DI_TYPES } from "../../../main/container/ioc.types.js";

export interface FollowTwitterAccountUseCaseInput {
  userId: string;
  accountId: string;
}

@injectable()
export class FollowTwitterAccountUseCase {
  constructor(
    @inject(DI_TYPES.TwitterAccountFollowRepository)
    private readonly followRepository: ITwitterAccountFollowRepository,
    @inject(DI_TYPES.TwitterAccountRepository)
    private readonly accountRepository: ITwitterAccountRepository,
    @inject(DI_TYPES.IdGenerator)
    private readonly idGenerator: IIdGenerator
  ) {}

  async execute(input: FollowTwitterAccountUseCaseInput): Promise<void> {
    const account = await this.accountRepository.findById(input.accountId);
    if (!account) {
      throw new Error("Twitter account does not exist.");
    }

    const existing = await this.followRepository.findByUserIdAndAccountId(
      input.userId,
      input.accountId
    );
    if (existing) {
      throw new Error("Already following this account.");
    }

    const follow = TwitterAccountFollow.create({
      id: this.idGenerator.generate(),
      userId: input.userId,
      accountId: input.accountId,
    });
    await this.followRepository.save(follow);
  }
}
