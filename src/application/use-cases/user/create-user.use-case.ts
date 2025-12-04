import { inject, injectable } from "inversify";

import { IUserRepository } from "../../../domain/repositories/user.repository.interface";
import { User } from "../../../domain/user/user";
import { DI_TYPES } from "../../../main/container/ioc.types.js";
import { IPasswordService } from "../../services/password.service";
import { IIdGenerator } from "../../services/id.service";

const DEFAULT_USER_NAME = process.env.DEFAULT_USER_NAME ?? "News Reader";
const DEFAULT_USER_IMAGE_URL =
  process.env.DEFAULT_USER_IMAGE_URL ?? "https://i.pravatar.cc/150?img=3";

export interface CreateUserUseCaseInput {
  email: string;
  password: string;
}

@injectable()
export class CreateUserUseCase {
  constructor(
    @inject(DI_TYPES.UserRepository)
    private readonly userRepository: IUserRepository,
    @inject(DI_TYPES.PasswordService)
    private readonly passwordService: IPasswordService,
    @inject(DI_TYPES.IdGenerator)
    private readonly idGenerator: IIdGenerator
  ) {}

  async execute(input: CreateUserUseCaseInput): Promise<User> {
    const existing = await this.userRepository.findByEmail(input.email);
    if (existing) {
      throw new Error("A user with this email already exists.");
    }

    const hashedPassword = await this.passwordService.hash(input.password);
    const user = User.create({
      id: this.idGenerator.generate(),
      name: DEFAULT_USER_NAME,
      imageUrl: DEFAULT_USER_IMAGE_URL,
      email: input.email,
      password: hashedPassword,
    });
    await this.userRepository.save(user);
    return user;
  }
}
