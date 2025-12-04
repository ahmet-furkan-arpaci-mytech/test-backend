export function getExpectedApiKey(): string | undefined {
  const value = process.env.X_API_KEY ?? process.env.API_KEY;
  return value && value.trim().length > 0 ? value.trim() : undefined;
}

export function isApiKeyRequired(): boolean {
  return Boolean(getExpectedApiKey());
}
