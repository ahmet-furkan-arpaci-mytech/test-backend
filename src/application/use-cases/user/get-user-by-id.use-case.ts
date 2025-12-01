import { IUserRepository } from "../../../domain/repositories/user.repository.interface";
import { User } from "../../../domain/user/user";

export interface GetUserByIdUseCaseInput {
  id: string;
}

export class GetUserByIdUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(input: GetUserByIdUseCaseInput): Promise<User> {
    const user = await this.userRepository.findById(input.id);
    if (!user) {
      throw new Error("User not found.");
    }
    return user;
  }
}
