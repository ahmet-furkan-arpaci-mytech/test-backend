export class Source {
  private constructor(
    private readonly _id: string,
    private _name: string,
    private _imageUrl: string,
    private _description: string,
    private readonly _sourceCategoryId: string
  ) {
    if (!_name || _name.trim() === "") {
      throw new Error("Source name cannot be empty.");
    }

    if (!_sourceCategoryId) {
      throw new Error("Source category cannot be empty.");
    }
  }

  /** Factory method */
  static create(props: {
    id: string;
    name: string;
    imageUrl: string;
    description: string;
    sourceCategoryId: string;
  }) {
    return new Source(
      props.id,
      props.name,
      props.imageUrl,
      props.description,
      props.sourceCategoryId
    );
  }

  get id(): string {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  get imageUrl(): string {
    return this._imageUrl;
  }

  get description(): string {
    return this._description;
  }

  get sourceCategoryId(): string {
    return this._sourceCategoryId;
  }

  /** Domain behavior */
  updateName(name: string) {
    if (!name || name.trim() === "") {
      throw new Error("Name cannot be empty.");
    }
    this._name = name;
  }

  updateImage(url: string) {
    this._imageUrl = url;
  }

  updateDescription(desc: string) {
    this._description = desc;
  }
}
