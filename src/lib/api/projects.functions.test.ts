import { describe, expect, it } from "vitest";
import { deriveStatus, PROGRESS_BY_STATUS } from "./projects.functions";

describe("deriveStatus", () => {
  it("maps no submission to not-started", () => {
    expect(deriveStatus(undefined)).toBe("not-started");
  });

  it("maps draft and changes_requested to in-progress", () => {
    expect(deriveStatus("draft")).toBe("in-progress");
    expect(deriveStatus("changes_requested")).toBe("in-progress");
  });

  it("maps submitted and under_review to submitted", () => {
    expect(deriveStatus("submitted")).toBe("submitted");
    expect(deriveStatus("under_review")).toBe("submitted");
  });

  it("maps approved and rejected to reviewed", () => {
    expect(deriveStatus("approved")).toBe("reviewed");
    expect(deriveStatus("rejected")).toBe("reviewed");
  });

  it("falls back to not-started for an unrecognized status", () => {
    expect(deriveStatus("something-unexpected")).toBe("not-started");
  });
});

describe("PROGRESS_BY_STATUS", () => {
  it("is monotonically increasing through the lifecycle", () => {
    expect(PROGRESS_BY_STATUS["not-started"]).toBeLessThan(PROGRESS_BY_STATUS["in-progress"]);
    expect(PROGRESS_BY_STATUS["in-progress"]).toBeLessThan(PROGRESS_BY_STATUS.submitted);
    expect(PROGRESS_BY_STATUS.submitted).toBeLessThan(PROGRESS_BY_STATUS.reviewed);
  });

  it("reviewed is complete", () => {
    expect(PROGRESS_BY_STATUS.reviewed).toBe(100);
  });
});
