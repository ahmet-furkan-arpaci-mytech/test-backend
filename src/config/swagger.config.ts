const DEFAULT_SWAGGER_BASE_URL = "http://localhost:4000";

export function getSwaggerBaseUrl(): string {
  return process.env.SWAGGER_BASE_URL ?? DEFAULT_SWAGGER_BASE_URL;
}
