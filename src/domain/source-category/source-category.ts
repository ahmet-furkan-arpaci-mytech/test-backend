export class SourceCategory {
  private constructor(
    private readonly _id: string,
    private _name: string,
    private _description: string
  ) {
    if (!_name || _name.trim() === "") {
      throw new Error("SourceCategory name cannot be empty.");
    }
  }

  /** Factory method */
  static create(props: { id: string; name: string; description: string }) {
    return new SourceCategory(props.id, props.name, props.description);
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

  /** Domain behaviors */
  updateName(name: string) {
    if (!name || name.trim() === "") {
      throw new Error("Name cannot be empty.");
    }
    this._name = name;
  }

  updateDescription(description: string) {
    this._description = description;
  }
}
