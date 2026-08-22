import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { formatDay } from "./attendance.functions";

describe("formatDay", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-11T09:00:00Z")); // a Wednesday
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("labels the current day as Today", () => {
    expect(formatDay(new Date("2026-03-11T14:00:00Z"))).toBe("Today");
  });

  it("labels the next day as Tomorrow", () => {
    expect(formatDay(new Date("2026-03-12T10:00:00Z"))).toBe("Tomorrow");
  });

  it("labels any other day by weekday name", () => {
    expect(formatDay(new Date("2026-03-13T10:00:00Z"))).toBe("Friday");
  });

  it("labels a past day by weekday name, not a negative offset", () => {
    expect(formatDay(new Date("2026-03-09T10:00:00Z"))).toBe("Monday");
  });
});
