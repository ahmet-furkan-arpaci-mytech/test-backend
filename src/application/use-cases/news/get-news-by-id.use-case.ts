import { INewsRepository } from "../../../domain/repositories/news.repository.interface";
import { News } from "../../../domain/news/news";

export interface GetNewsByIdUseCaseInput {
  id: string;
}

export class GetNewsByIdUseCase {
  constructor(private readonly newsRepository: INewsRepository) {}

  async execute(input: GetNewsByIdUseCaseInput): Promise<News> {
    const news = await this.newsRepository.findById(input.id);
    if (!news) {
      throw new Error("News item not found.");
    }
    return news;
  }
}
