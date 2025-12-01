import { randomUUID } from "crypto";
import { injectable } from "inversify";

export interface IIdGenerator {
  generate(): string;
}

@injectable()
export class UuidGenerator implements IIdGenerator {
  generate(): string {
    return randomUUID();
  }
}
