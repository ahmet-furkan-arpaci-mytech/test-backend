export class TwitterAccount {
  private constructor(
    private readonly _id: string,
    private readonly _handle: string,
    private readonly _displayName: string,
    private readonly _imageUrl: string,
    private readonly _bio: string,
    private readonly _createdAt: Date
  ) {
    if (!_handle || _handle.trim() === "") {
      throw new Error("Twitter handle cannot be empty.");
    }

    if (!_displayName || _displayName.trim() === "") {
      throw new Error("Twitter display name cannot be empty.");
    }

    if (!_imageUrl || _imageUrl.trim() === "") {
      throw new Error("Twitter account image url cannot be empty.");
    }
  }

  static create(props: {
    id: string;
    handle: string;
    displayName: string;
    imageUrl: string;
    bio?: string;
    createdAt?: Date;
  }) {
    return new TwitterAccount(
      props.id,
      props.handle,
      props.displayName,
      props.imageUrl,
      props.bio ?? "",
      props.createdAt ?? new Date()
    );
  }

  get id(): string {
    return this._id;
  }

  get handle(): string {
    return this._handle;
  }

  get displayName(): string {
    return this._displayName;
  }

  get imageUrl(): string {
    return this._imageUrl;
  }

  get bio(): string {
    return this._bio;
  }

  get createdAt(): Date {
    return this._createdAt;
  }
}
