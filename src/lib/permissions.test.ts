import { describe, expect, it } from "vitest";
import { can, canAny, roleHome, rolePermissions } from "./permissions";

describe("can", () => {
  it("grants a permission listed for the role", () => {
    expect(can("student", "attendance:checkin")).toBe(true);
  });

  it("denies a permission not listed for the role", () => {
    expect(can("student", "platform:manage")).toBe(false);
  });

  it("does not grant admin projects:submit — submitting is a student action", () => {
    expect(can("admin", "projects:submit")).toBe(false);
  });
});

describe("canAny", () => {
  it("is true if at least one permission matches", () => {
    expect(canAny("mentor", ["platform:manage", "projects:review"])).toBe(true);
  });

  it("is false if none match", () => {
    expect(canAny("student", ["platform:manage", "students:manage"])).toBe(false);
  });
});

describe("roleHome", () => {
  it("maps every role to a distinct landing route", () => {
    const routes = Object.values(roleHome);
    expect(new Set(routes).size).toBe(routes.length);
  });
});
