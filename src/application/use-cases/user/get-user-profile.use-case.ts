import { inject, injectable } from "inversify";

import { IUserRepository } from "../../../domain/repositories/user.repository.interface";
import { DI_TYPES } from "../../../main/container/ioc.types.js";
import { User } from "../../../domain/user/user";

@injectable()
export class GetUserProfileUseCase {
  constructor(
    @inject(DI_TYPES.UserRepository)
    private readonly userRepository: IUserRepository
  ) {}

  async execute(userId: string): Promise<User> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  }
}
