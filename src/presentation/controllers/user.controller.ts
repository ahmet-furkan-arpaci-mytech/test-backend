import type { Request, Response } from "express";
import { inject, injectable } from "inversify";

import { ResponseBuilder } from "../response/response-builder.js";
import { CreateUserUseCase } from "../../application/use-cases/user/create-user.use-case.js";
import { AuthenticateUserUseCase } from "../../application/use-cases/user/authenticate-user.use-case.js";
import { DI_TYPES } from "../../main/container/ioc.types.js";

@injectable()
export class UserController {
  constructor(
    @inject(DI_TYPES.CreateUserUseCase)
    private readonly createUserUseCase: CreateUserUseCase,
    @inject(DI_TYPES.AuthenticateUserUseCase)
    private readonly authenticateUserUseCase: AuthenticateUserUseCase
  ) {}

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
  *     security: []
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
    return ResponseBuilder.created(res, user, "User created");
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
  *     security: []
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
}
