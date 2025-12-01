import { ITwitterRepository } from "../../../domain/repositories/twitter.repository.interface";
import { Tweet } from "../../../domain/twitter/tweet";
import { IIdGenerator } from "../../services/id.service";

export interface CreateTweetUseCaseInput {
  accountId: string;
  accountName: string;
  accountImageUrl: string;
  content: string;
  isPopular?: boolean;
}

export class CreateTweetUseCase {
  constructor(
    private readonly twitterRepository: ITwitterRepository,
    private readonly idGenerator: IIdGenerator
  ) {}

  async execute(input: CreateTweetUseCaseInput): Promise<Tweet> {
    const tweet = Tweet.create({
      id: this.idGenerator.generate(),
      accountId: input.accountId,
      accountName: input.accountName,
      accountImageUrl: input.accountImageUrl,
      content: input.content,
      isPopular: input.isPopular,
    });

    await this.twitterRepository.save(tweet);
    return tweet;
  }
}
