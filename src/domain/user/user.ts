export class User {
  private constructor(
    private readonly _id: string,
    private _name: string,
    private _imageUrl: string,
    private _email: string,
    private _password: string
  ) {
    if (!_email || _email.trim() === "") {
      throw new Error("User email cannot be empty.");
    }
  }
  /** Factory method */
  static create(props: {
    id: string;
    name: string;
    imageUrl: string;
    email: string;
    password: string;
  }) {
    return new User(
      props.id,
      props.name,
      props.imageUrl,
      props.email,
      props.password
    );
  }

  get id(): string {
    return this._id;
  }

  get email(): string {
    return this._email;
  }

  get password(): string {
    return this._password;
  }

  get name(): string {
    return this._name;
  }
  get imageUrl(): string {
    return this._imageUrl;
  }
}
