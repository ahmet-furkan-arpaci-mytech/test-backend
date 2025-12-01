export class UserSourceFollow {
  private constructor(
    private readonly _id: string,
    private readonly _userId: string,
    private readonly _sourceId: string
  ) {
    if (!_userId) {
      throw new Error("UserSourceFollow requires a userId.");
    }

    if (!_sourceId) {
      throw new Error("UserSourceFollow requires a sourceId.");
    }
  }

  static create(props: { id: string; userId: string; sourceId: string }) {
    return new UserSourceFollow(props.id, props.userId, props.sourceId);
  }

  get id(): string {
    return this._id;
  }

  get userId(): string {
    return this._userId;
  }

  get sourceId(): string {
    return this._sourceId;
  }
}
