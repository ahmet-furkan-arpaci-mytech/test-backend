import { inject, injectable } from "inversify";

import { IUserRepository } from "../../../domain/repositories/user.repository.interface";
import { IPasswordService } from "../../services/password.service";
import { ITokenService } from "../../services/token.service";
import { DI_TYPES } from "../../../main/container/ioc.types.js";

export interface AuthenticateUserUseCaseInput {
  email: string;
  password: string;
}

export interface AuthenticateUserUseCaseResult {
  accessToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    imageUrl: string;
  };
}

@injectable()
export class AuthenticateUserUseCase {
  constructor(
    @inject(DI_TYPES.UserRepository)
    private readonly userRepository: IUserRepository,
    @inject(DI_TYPES.PasswordService)
    private readonly passwordService: IPasswordService,
    @inject(DI_TYPES.TokenService)
    private readonly tokenService: ITokenService
  ) {}

  async execute(input: AuthenticateUserUseCaseInput): Promise<AuthenticateUserUseCaseResult> {
    const user = await this.userRepository.findByEmail(input.email);
    if (!user) {
      throw new Error("Invalid credentials.");
    }

    const isPasswordValid = await this.passwordService.compare(
      input.password,
      user.password
    );

    if (!isPasswordValid) {
      throw new Error("Invalid credentials.");
    }

    const accessToken = this.tokenService.issueToken({
      sub: user.id,
      email: user.email,
      name: user.name,
    });

    return {
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        imageUrl: user.imageUrl,
      },
    };
  }
}
