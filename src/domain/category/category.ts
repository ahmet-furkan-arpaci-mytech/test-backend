export class Category {
  private constructor(
    private readonly _id: string,
    private _name: string,
    private _description: string,
    private _colorCode: string,
    private _imageUrl: string
  ) {
    if (!_name || _name.trim() === "") {
      throw new Error("Category name cannot be empty.");
    }

    if (!_colorCode || _colorCode.trim() === "") {
      throw new Error("Category color code cannot be empty.");
    }

    if (!_imageUrl || _imageUrl.trim() === "") {
      throw new Error("Category image url cannot be empty.");
    }
  }

  static create(props: {
    id: string;
    name: string;
    description: string;
    colorCode: string;
    imageUrl: string;
  }) {
    return new Category(
      props.id,
      props.name,
      props.description,
      props.colorCode,
      props.imageUrl
    );
  }

  get id(): string {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  get description(): string {
    return this._description;
  }

  get colorCode(): string {
    return this._colorCode;
  }

  updateName(name: string) {
    if (!name || name.trim() === "") {
      throw new Error("Category name cannot be empty.");
    }
    this._name = name;
  }

  updateDescription(description: string) {
    this._description = description;
  }

  get imageUrl(): string {
    return this._imageUrl;
  }

  updateColor(colorCode: string) {
    if (!colorCode || colorCode.trim() === "") {
      throw new Error("Category color code cannot be empty.");
    }
    this._colorCode = colorCode;
  }

  updateImage(imageUrl: string) {
    if (!imageUrl || imageUrl.trim() === "") {
      throw new Error("Category image url cannot be empty.");
    }
    this._imageUrl = imageUrl;
  }
}
