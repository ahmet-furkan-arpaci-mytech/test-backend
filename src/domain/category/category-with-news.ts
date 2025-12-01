import { Category } from "./category";
import { News } from "../news/news";

export class CategoryWithNews {
  constructor(
    private readonly _category: Category,
    private readonly _news: News[]
  ) {}

  get category(): Category {
    return this._category;
  }

  get news(): News[] {
    return this._news;
  }
}
