import { inject, injectable } from "inversify";

import { ITwitterAccountRepository } from "../../../domain/repositories/twitter-account.repository.interface";
import { PaginatedResult } from "../../../domain/common/paginated-result";
import { TwitterAccount } from "../../../domain/twitter-account/twitter-account";
import { DI_TYPES } from "../../../main/container/ioc.types.js";
import { IIdGenerator } from "../../services/id.service";

export interface CreateTwitterAccountUseCaseInput {
  handle: string;
  displayName: string;
  imageUrl: string;
  bio?: string;
}

@injectable()
export class CreateTwitterAccountUseCase {
  constructor(
    @inject(DI_TYPES.TwitterAccountRepository)
    private readonly repository: ITwitterAccountRepository,
    @inject(DI_TYPES.IdGenerator)
    private readonly idGenerator: IIdGenerator
  ) {}

  async execute(input: CreateTwitterAccountUseCaseInput): Promise<TwitterAccount> {
    const account = TwitterAccount.create({
      id: this.idGenerator.generate(),
      handle: input.handle,
      displayName: input.displayName,
      imageUrl: input.imageUrl,
      bio: input.bio,
    });
    await this.repository.save(account);
    return account;
  }
}
