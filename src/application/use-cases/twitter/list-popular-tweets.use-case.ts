import { ITwitterRepository } from "../../../domain/repositories/twitter.repository.interface";
import { Tweet } from "../../../domain/twitter/tweet";

export class ListPopularTweetsUseCase {
  constructor(private readonly twitterRepository: ITwitterRepository) {}

  execute(limit = 5): Promise<Tweet[]> {
    return this.twitterRepository.findPopular(limit);
  }
}
