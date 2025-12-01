export class TwitterAccountFollow {
  private constructor(
    private readonly _id: string,
    private readonly _userId: string,
    private readonly _accountId: string
  ) {
    if (!_userId) {
      throw new Error("TwitterAccountFollow requires a userId.");
    }

    if (!_accountId) {
      throw new Error("TwitterAccountFollow requires an accountId.");
    }
  }

  static create(props: { id: string; userId: string; accountId: string }) {
    return new TwitterAccountFollow(props.id, props.userId, props.accountId);
  }

  get id(): string {
    return this._id;
  }

  get userId(): string {
    return this._userId;
  }

  get accountId(): string {
    return this._accountId;
  }
}
