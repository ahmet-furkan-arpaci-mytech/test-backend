export class AppError extends Error {
  constructor(message: string, public readonly statusCode = 400) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}
