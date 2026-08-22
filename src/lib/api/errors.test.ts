import { describe, expect, it } from "vitest";
import {
  AppError,
  ForbiddenError,
  isAppError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from "./errors";

describe("AppError subclasses", () => {
  it("UnauthorizedError carries a 401 and a default message", () => {
    const error = new UnauthorizedError();
    expect(error.code).toBe("UNAUTHORIZED");
    expect(error.status).toBe(401);
    expect(error.message).toBe("Sign in to continue");
  });

  it("ForbiddenError carries a 403", () => {
    const error = new ForbiddenError();
    expect(error.code).toBe("FORBIDDEN");
    expect(error.status).toBe(403);
  });

  it("ValidationError carries a 422 and accepts a custom message", () => {
    const error = new ValidationError("That link is already taken");
    expect(error.code).toBe("VALIDATION_ERROR");
    expect(error.status).toBe(422);
    expect(error.message).toBe("That link is already taken");
  });

  it("NotFoundError formats the subject into the message", () => {
    const error = new NotFoundError("Project");
    expect(error.code).toBe("NOT_FOUND");
    expect(error.status).toBe(404);
    expect(error.message).toBe("Project not found");
  });
});

describe("isAppError", () => {
  it("is true for AppError and its subclasses", () => {
    expect(isAppError(new AppError("X", "x", 400))).toBe(true);
    expect(isAppError(new NotFoundError("Thing"))).toBe(true);
  });

  it("is false for a plain Error or non-error values", () => {
    expect(isAppError(new Error("plain"))).toBe(false);
    expect(isAppError("oops")).toBe(false);
    expect(isAppError(null)).toBe(false);
    expect(isAppError(undefined)).toBe(false);
  });
});
