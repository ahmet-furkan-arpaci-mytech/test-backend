export class SavedNews {
  private constructor(
    private readonly _id: string,
    private readonly _userId: string,
    private readonly _newsId: string,
    private _savedAt: Date
  ) {
    if (!_userId) {
      throw new Error("SavedNews requires a userId.");
    }

    if (!_newsId) {
      throw new Error("SavedNews requires a newsId.");
    }
  }

  static create(props: {
    id: string;
    userId: string;
    newsId: string;
    savedAt?: Date;
  }) {
    return new SavedNews(
      props.id,
      props.userId,
      props.newsId,
      props.savedAt ?? new Date()
    );
  }

  get id(): string {
    return this._id;
  }

  get userId(): string {
    return this._userId;
  }

  get newsId(): string {
    return this._newsId;
  }

  get savedAt(): Date {
    return this._savedAt;
  }

  updateSavedAt(date: Date) {
    this._savedAt = date;
  }
}
