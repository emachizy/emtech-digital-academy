/**
 * Shared error taxonomy for server functions.
 *
 * Server functions return their data directly on success — no {success,data}
 * envelope, since TanStack Query already tracks success/error/loading state
 * and a wrapper would just duplicate that. Failures are communicated by
 * throwing one of these instead: each carries a stable `code` and a message
 * that is always safe to show a user. The global function middleware
 * (src/start.ts) passes these through untouched but rewrites any OTHER
 * thrown error into a generic InternalError, so a raw database/Supabase
 * error message never reaches the client.
 */
export class AppError extends Error {
  readonly code: string;
  readonly status: number;

  constructor(code: string, message: string, status = 400) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.status = status;
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Sign in to continue") {
    super("UNAUTHORIZED", message, 401);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "You don't have permission to do this") {
    super("FORBIDDEN", message, 403);
    this.name = "ForbiddenError";
  }
}

export class ValidationError extends AppError {
  constructor(message = "Invalid input") {
    super("VALIDATION_ERROR", message, 422);
    this.name = "ValidationError";
  }
}

/**
 * Kept constructor-compatible with the original mock-era NotFoundError:
 * src/lib/api/index.ts already throws `new NotFoundError("Subject")` in
 * several places. Now part of the AppError family so the error-
 * normalization middleware recognizes it as already safe to surface as-is.
 */
export class NotFoundError extends AppError {
  constructor(what: string) {
    super("NOT_FOUND", `${what} not found`, 404);
    this.name = "NotFoundError";
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}
