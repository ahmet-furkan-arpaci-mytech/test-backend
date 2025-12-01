export class ResponseBuilder {
  // -------------------------
  //      SUCCESS STATES
  // -------------------------

  static ok<T>(res: any, result: T, message = "OK") {
    return res.status(200).json({
      success: true,
      message,
      result,
    });
  }

  static created<T>(res: any, result: T, message = "Created") {
    return res.status(201).json({
      success: true,
      message,
      result,
    });
  }

  static accepted<T>(res: any, result: T, message = "Accepted") {
    return res.status(202).json({
      success: true,
      message,
      result,
    });
  }

  static noContent(res: any) {
    return res.status(204).send();
  }

  // -------------------------
  //       ERROR STATES
  // -------------------------

  static badRequest(res: any, message = "Bad Request", errorCode?: number) {
    return this.error(res, message, 400, errorCode);
  }

  static unauthorized(res: any, message = "Unauthorized", errorCode?: number) {
    return this.error(res, message, 401, errorCode);
  }

  static forbidden(res: any, message = "Forbidden", errorCode?: number) {
    return this.error(res, message, 403, errorCode);
  }

  static notFound(res: any, message = "Not Found", errorCode?: number) {
    return this.error(res, message, 404, errorCode);
  }

  static conflict(res: any, message = "Conflict", errorCode?: number) {
    return this.error(res, message, 409, errorCode);
  }

  static tooManyRequests(
    res: any,
    message = "Too Many Requests",
    errorCode?: number
  ) {
    return this.error(res, message, 429, errorCode);
  }

  static internal(
    res: any,
    message = "Internal Server Error",
    errorCode?: number
  ) {
    return this.error(res, message, 500, errorCode);
  }

  static badGateway(res: any, message = "Bad Gateway", errorCode?: number) {
    return this.error(res, message, 502, errorCode);
  }

  static serviceUnavailable(
    res: any,
    message = "Service Unavailable",
    errorCode?: number
  ) {
    return this.error(res, message, 503, errorCode);
  }

  // -------------------------
  //      GENERIC ERROR
  // -------------------------

  static error(
    res: any,
    message: string,
    statusCode = 400,
    errorCode?: number,
    result: any = null
  ) {
    return res.status(statusCode).json({
      success: false,
      message,
      result,
      errorCode,
    });
  }
}
