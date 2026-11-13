/**
 * Base Application Error adhering to SRS v0.1.1 Section 8.1.
 */
export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'AppError';
    Object.setPrototypeOf(this, new.target.prototype);
  }

  public static notFound(code: string, message: string): AppError {
    return new AppError(404, code, message);
  }

  public static badRequest(
    code: string,
    message: string,
    details?: unknown,
  ): AppError {
    return new AppError(400, code, message, details);
  }

  public static internal(
    message = 'Terjadi kesalahan internal pada server.',
    details?: unknown,
  ): AppError {
    return new AppError(500, 'INTERNAL_SERVER_ERROR', message, details);
  }
}
