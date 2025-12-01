import type { NextFunction, Request, Response } from "express";

import { AppError } from "../../application/exceptions/app-error";
import { DomainException } from "../../domain/common/exceptions/domain.exception";
import { ResponseBuilder } from "../response/response-builder.js";

export function globalErrorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (err instanceof AppError) {
    return ResponseBuilder.error(res, err.message, err.statusCode);
  }

  if (err instanceof DomainException) {
    return ResponseBuilder.error(res, err.message, 400);
  }

  return ResponseBuilder.error(
    res,
    process.env.NODE_ENV === "production" ? err.message : err.message,
    500
  );
}
