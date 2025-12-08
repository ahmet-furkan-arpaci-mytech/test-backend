import type { NextFunction, Request, Response } from "express";

import { DI_TYPES } from "../../main/container/ioc.types.js";
import { ITokenService } from "../../application/services/token.service.js";
import { ResponseBuilder } from "../response/response-builder.js";
import { container } from "../../main/container/inversify.config.js";
import { getExpectedApiKey } from "../../config/api-key.config.js";

const API_PREFIX = (process.env.API_PREFIX ?? "/api/v1").toLowerCase();
const PUBLIC_ENDPOINTS = [`${API_PREFIX}/users`, `${API_PREFIX}/users/login`];

interface AuthenticatedRequest extends Request {
  user?: Record<string, any>;
}

const tokenService = container.get<ITokenService>(DI_TYPES.TokenService);

function hasValidApiKey(req: Request): boolean {
  const expected = getExpectedApiKey();
  if (!expected) {
    return false;
  }

  const headerValue = req.header("x-api-key") ?? req.header("X-API-Key");
  return headerValue === expected;
}

function isPublicRoute(req: Request): boolean {
  if (req.method === "OPTIONS") {
    return true;
  }

  if (req.path.startsWith("/docs") || req.path.startsWith("/swagger")) {
    return true;
  }

  const target = req.path.toLowerCase();
  return PUBLIC_ENDPOINTS.includes(target) && req.method === "POST";
}

export function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  if (isPublicRoute(req)) {
    return next();
  }

  const authHeader = req.headers.authorization;
  const bearerProvided =
    typeof authHeader === "string" && authHeader.startsWith("Bearer ");
  const apiKeyProvided = hasValidApiKey(req);

  if (!bearerProvided && apiKeyProvided) {
    return next();
  }

  if (!bearerProvided) {
    return ResponseBuilder.unauthorized(
      res,
      "Authorization header missing or malformed"
    );
  }

  const token = (authHeader as string).replace(/^Bearer\s+/i, "");
  try {
    const payload = tokenService.verifyToken(token);
    req.user = payload;
    return next();
  } catch (error) {
    return ResponseBuilder.unauthorized(
      res,
      error instanceof Error ? error.message : "Invalid token"
    );
  }
}
