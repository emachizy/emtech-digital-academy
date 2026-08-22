import { describe, expect, it } from "vitest";
import { levelTitle, xpToNextLevel } from "./student.functions";

describe("levelTitle", () => {
  it("returns the title for a valid level", () => {
    expect(levelTitle(1)).toBe("Newcomer");
    expect(levelTitle(7)).toBe("Frontend Explorer");
  });

  it("clamps below the minimum level to the first title", () => {
    expect(levelTitle(0)).toBe("Newcomer");
    expect(levelTitle(-5)).toBe("Newcomer");
  });

  it("clamps above the maximum level to the last title", () => {
    expect(levelTitle(999)).toBe("Frontend Master");
  });
});

describe("xpToNextLevel", () => {
  it("increases linearly with level", () => {
    expect(xpToNextLevel(1)).toBe(800);
    expect(xpToNextLevel(2)).toBe(1200);
  });

  it("is always greater than the level itself", () => {
    for (let level = 1; level <= 10; level++) {
      expect(xpToNextLevel(level)).toBeGreaterThan(level);
    }
  });
});
