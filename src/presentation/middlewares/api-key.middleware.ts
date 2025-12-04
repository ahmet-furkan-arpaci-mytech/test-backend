import type { Request, Response, NextFunction } from "express";

import { ResponseBuilder } from "../response/response-builder.js";
import { getExpectedApiKey, isApiKeyRequired } from "../../config/api-key.config.js";

export function apiKeyMiddleware(req: Request, res: Response, next: NextFunction) {
  if (!isApiKeyRequired()) {
    return next();
  }

  if (req.path.startsWith("/docs")) {
    return next();
  }

  const headerValue = req.header("x-api-key") ?? req.header("X-API-Key");
  const expected = getExpectedApiKey();
  if (!headerValue || headerValue !== expected) {
    return ResponseBuilder.unauthorized(res, "Missing or invalid API key");
  }

  next();
}
