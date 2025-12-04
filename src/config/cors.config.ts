import type { CorsOptions } from "cors";

const DEFAULT_ALLOWED_ORIGINS = ["http://localhost:3000"];

function parseAllowedOrigins(raw?: string): string[] {
  if (!raw) {
    return [];
  }
  return raw
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

export function getAllowedOrigins(): string[] {
  const configured = parseAllowedOrigins(process.env.CORS_ALLOWED_ORIGINS);
  return configured.length > 0 ? configured : DEFAULT_ALLOWED_ORIGINS;
}

export function buildCorsOptions(): CorsOptions {
  const allowedOrigins = getAllowedOrigins();

  const originChecker: CorsOptions["origin"] = (origin, callback) => {
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes("*") || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error("CORS origin not allowed"));
  };

  return {
    origin: originChecker,
    credentials: true,
  };
}
