import { describe, expect, it } from "vitest";
import { slugPattern } from "./portfolio.functions";

describe("slugPattern", () => {
  it("accepts lowercase letters, numbers and hyphens", () => {
    expect(slugPattern.test("alex-johnson")).toBe(true);
    expect(slugPattern.test("alex123")).toBe(true);
    expect(slugPattern.test("abc")).toBe(true);
  });

  it("rejects uppercase letters", () => {
    expect(slugPattern.test("Alex-Johnson")).toBe(false);
  });

  it("rejects spaces and other punctuation", () => {
    expect(slugPattern.test("alex johnson")).toBe(false);
    expect(slugPattern.test("alex_johnson")).toBe(false);
    expect(slugPattern.test("alex.johnson")).toBe(false);
  });

  it("rejects strings shorter than 3 characters", () => {
    expect(slugPattern.test("ab")).toBe(false);
  });

  it("rejects strings longer than 40 characters", () => {
    expect(slugPattern.test("a".repeat(41))).toBe(false);
  });

  it("accepts the boundary lengths", () => {
    expect(slugPattern.test("a".repeat(3))).toBe(true);
    expect(slugPattern.test("a".repeat(40))).toBe(true);
  });
});
