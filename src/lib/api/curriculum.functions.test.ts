import { describe, expect, it } from "vitest";
import { deriveStatus } from "./curriculum.functions";

describe("deriveStatus", () => {
  it("is completed when the topic itself is completed", () => {
    expect(deriveStatus(0, true, -1)).toBe("completed");
    expect(deriveStatus(5, true, 2)).toBe("completed");
  });

  it("is in-progress for exactly the next topic after the last completed one", () => {
    expect(deriveStatus(0, false, -1)).toBe("in-progress");
    expect(deriveStatus(3, false, 2)).toBe("in-progress");
  });

  it("is not-started for topics before or at the last completed index that aren't completed", () => {
    expect(deriveStatus(1, false, 2)).toBe("not-started");
  });

  it("is locked for topics beyond the next unlockable one", () => {
    expect(deriveStatus(4, false, 2)).toBe("locked");
  });
});
