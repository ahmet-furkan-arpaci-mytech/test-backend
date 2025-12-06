import type { Request, Response } from "express";
import { inject, injectable } from "inversify";

import { ResponseBuilder } from "../response/response-builder.js";
import { CreateUserUseCase } from "../../application/use-cases/user/create-user.use-case.js";
import { AuthenticateUserUseCase } from "../../application/use-cases/user/authenticate-user.use-case.js";
import { GetUserProfileUseCase } from "../../application/use-cases/user/get-user-profile.use-case.js";
import { DI_TYPES } from "../../main/container/ioc.types.js";
import { User } from "../../domain/user/user.js";

type AuthenticatedRequest = Request & { user?: Record<string, any> };

const toUserResponse = (user: User) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  imageUrl: user.imageUrl,
});

@injectable()
export class UserController {
  constructor(
    @inject(DI_TYPES.CreateUserUseCase)
    private readonly createUserUseCase: CreateUserUseCase,
    @inject(DI_TYPES.AuthenticateUserUseCase)
    private readonly authenticateUserUseCase: AuthenticateUserUseCase,
    @inject(DI_TYPES.GetUserProfileUseCase)
    private readonly getUserProfileUseCase: GetUserProfileUseCase
  ) {}

  private extractUserId(req: AuthenticatedRequest) {
    return req.user?.sub ?? req.user?.id ?? req.user?.userId;
  }

  /**
   * @openapi
   * /api/v1/users:
   *   post:
   *     tags:
   *       - Users
   *     summary: Create a new user
  *     requestBody:
  *       required: true
  *       content:
  *         application/json:
  *           schema:
  *             $ref: "#/components/schemas/UserRegistration"
   *     security:
   *       - ApiKeyAuth: []
  *     responses:
   *       201:
   *         description: The user was created successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: "#/components/schemas/UserResponse"
   *       409:
   *         description: Email already exists
   *         content:
   *           application/json:
   *             schema:
   *               $ref: "#/components/schemas/ErrorResponse"
   */
  async createUser(req: Request, res: Response) {
    const user = await this.createUserUseCase.execute(req.body);
    return ResponseBuilder.created(
      res,
      toUserResponse(user),
      "User created"
    );
  }

  /**
   * @openapi
   * /api/v1/users/login:
   *   post:
   *     tags:
   *       - Users
   *     summary: Authenticate an existing user
  *     requestBody:
  *       required: true
  *       content:
  *         application/json:
  *           schema:
  *             $ref: "#/components/schemas/UserAuthentication"
   *     security:
   *       - ApiKeyAuth: []
  *     responses:
   *       200:
   *         description: Authenticated user
   *         content:
   *           application/json:
   *             schema:
   *               $ref: "#/components/schemas/AuthResponse"
   *       401:
   *         description: Invalid credentials
   *         content:
   *           application/json:
   *             schema:
   *               $ref: "#/components/schemas/ErrorResponse"
   */
  async authenticateUser(req: Request, res: Response) {
    const result = await this.authenticateUserUseCase.execute(req.body);
    return ResponseBuilder.ok(res, result, "Authenticated");
  }

  /**
   * @openapi
   * /api/v1/users/profile:
   *   get:
   *     tags:
   *       - Users
   *     summary: Get the authenticated user's profile
   *     security:
   *       - BearerAuth: []
   *     responses:
   *       200:
   *         description: Profile returned
   *         content:
   *           application/json:
   *             schema:
   *               $ref: "#/components/schemas/UserResponse"
   *       401:
   *         description: Authentication required
   *         content:
   *           application/json:
   *             schema:
   *               $ref: "#/components/schemas/ErrorResponse"
   */
  async getProfile(req: AuthenticatedRequest, res: Response) {
    const userId = this.extractUserId(req);
    if (!userId) {
      return ResponseBuilder.unauthorized(res, "User context required");
    }

    const user = await this.getUserProfileUseCase.execute(userId);
    const result = {
      id: user.id,
      name: user.name,
      email: user.email,
      imageUrl: user.imageUrl,
    };
    return ResponseBuilder.ok(res, result, "Profile retrieved");
  }
}
