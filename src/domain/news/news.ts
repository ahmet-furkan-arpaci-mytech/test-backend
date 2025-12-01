export class News {
  private constructor(
    private readonly _id: string,
    private _title: string,
    private _content: string,
    private _imageUrl: string,
    private readonly _categoryId: string,
    private readonly _sourceId: string,
    private _publishedAt: Date,
    private _isLatest: boolean,
    private _isPopular: boolean,
    private readonly _sourceName?: string,
    private readonly _categoryName?: string
  ) {
    if (!_title || _title.trim() === "") {
      throw new Error("News title cannot be empty.");
    }

    if (!_categoryId) {
      throw new Error("News category cannot be empty.");
    }

    if (!_sourceId) {
      throw new Error("News source cannot be empty.");
    }
  }

  static create(props: {
    id: string;
    title: string;
    content: string;
    imageUrl: string;
    categoryId: string;
    sourceId: string;
    publishedAt?: Date;
    isLatest?: boolean;
    isPopular?: boolean;
    sourceName?: string;
    categoryName?: string;
  }) {
    return new News(
      props.id,
      props.title,
      props.content,
      props.imageUrl,
      props.categoryId,
      props.sourceId,
      props.publishedAt ?? new Date(),
      props.isLatest ?? false,
      props.isPopular ?? false,
      props.sourceName,
      props.categoryName
    );
  }

  get id(): string {
    return this._id;
  }

  get title(): string {
    return this._title;
  }

  get content(): string {
    return this._content;
  }

  get imageUrl(): string {
    return this._imageUrl;
  }

  get categoryId(): string {
    return this._categoryId;
  }

  get sourceId(): string {
    return this._sourceId;
  }

  get publishedAt(): Date {
    return this._publishedAt;
  }

  get isLatest(): boolean {
    return this._isLatest;
  }

  get isPopular(): boolean {
    return this._isPopular;
  }

  get sourceName(): string | undefined {
    return this._sourceName;
  }

  get categoryName(): string | undefined {
    return this._categoryName;
  }

  updateTitle(title: string) {
    if (!title || title.trim() === "") {
      throw new Error("News title cannot be empty.");
    }
    this._title = title;
  }

  updateContent(content: string) {
    this._content = content;
  }

  updateImage(url: string) {
    this._imageUrl = url;
  }

  updatePublishedAt(date: Date) {
    this._publishedAt = date;
  }
}
