export class Tweet {
  private constructor(
    private readonly _id: string,
    private readonly _accountId: string,
    private readonly _accountName: string,
    private readonly _accountImageUrl: string,
    private _content: string,
    private readonly _createdAt: Date,
    private _isPopular: boolean
  ) {
    if (!_accountName || _accountName.trim() === "") {
      throw new Error("Account name cannot be empty.");
    }

    if (!_accountImageUrl || _accountImageUrl.trim() === "") {
      throw new Error("Account image url cannot be empty.");
    }

    if (!_accountId || _accountId.trim() === "") {
      throw new Error("Tweet requires an accountId.");
    }

    if (!_content || _content.trim() === "") {
      throw new Error("Tweet content cannot be empty.");
    }
  }

  static create(props: {
    id: string;
    accountId: string;
    accountName: string;
    accountImageUrl: string;
    content: string;
    createdAt?: Date;
    isPopular?: boolean;
  }) {
    return new Tweet(
      props.id,
      props.accountId,
      props.accountName,
      props.accountImageUrl,
      props.content,
      props.createdAt ?? new Date(),
      props.isPopular ?? false,
    );
  }

  get id(): string {
    return this._id;
  }

  get accountId(): string {
    return this._accountId;
  }

  get accountName(): string {
    return this._accountName;
  }

  get accountImageUrl(): string {
    return this._accountImageUrl;
  }

  get content(): string {
    return this._content;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get isPopular(): boolean {
    return this._isPopular;
  }

  updateContent(content: string) {
    if (!content || content.trim() === "") {
      throw new Error("Tweet content cannot be empty.");
    }
    this._content = content;
  }

  markAsPopular(popular: boolean) {
    this._isPopular = popular;
  }

}
