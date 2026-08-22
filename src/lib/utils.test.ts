import { describe, expect, it } from "vitest";
import { cn, initials } from "./utils";

describe("initials", () => {
  it("takes the first letter of the first two words", () => {
    expect(initials("Alex Johnson")).toBe("AJ");
  });

  it("uppercases the result", () => {
    expect(initials("alex johnson")).toBe("AJ");
  });

  it("handles a single word", () => {
    expect(initials("Madonna")).toBe("M");
  });

  it("ignores extra whitespace between words", () => {
    expect(initials("  Alex   Johnson  ")).toBe("AJ");
  });

  it("ignores a third word", () => {
    expect(initials("Alex Middle Johnson")).toBe("AM");
  });

  it("falls back to a placeholder for an empty name", () => {
    expect(initials("")).toBe("?");
    expect(initials("   ")).toBe("?");
  });
});

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("px-2", "py-4")).toBe("px-2 py-4");
  });

  it("resolves conflicting Tailwind classes to the last one", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });

  it("drops falsy values", () => {
    expect(cn("px-2", false, undefined, null, "py-4")).toBe("px-2 py-4");
  });
});
