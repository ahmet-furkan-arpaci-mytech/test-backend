import { SavedNews } from "../saved-news/saved-news";

export interface ISavedNewsRepository {
  findById(id: string): Promise<SavedNews | null>;
  findByUserId(userId: string): Promise<SavedNews[]>;
  findByUserAndNews(userId: string, newsId: string): Promise<SavedNews | null>;
  save(entity: SavedNews): Promise<void>;
  delete(id: string): Promise<void>;
}
