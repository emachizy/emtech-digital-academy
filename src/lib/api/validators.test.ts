import { describe, expect, it } from "vitest";
import { httpUrl } from "./validators";

describe("httpUrl", () => {
  it("accepts http and https URLs", () => {
    expect(httpUrl.safeParse("https://example.com").success).toBe(true);
    expect(httpUrl.safeParse("http://example.com").success).toBe(true);
  });

  it("rejects a javascript: URI even though it is a syntactically valid URL", () => {
    expect(httpUrl.safeParse("javascript:alert(document.cookie)").success).toBe(false);
  });

  it("rejects other non-http(s) schemes", () => {
    expect(httpUrl.safeParse("data:text/html,<script>alert(1)</script>").success).toBe(false);
    expect(httpUrl.safeParse("file:///etc/passwd").success).toBe(false);
  });

  it("rejects strings that aren't URLs at all", () => {
    expect(httpUrl.safeParse("not a url").success).toBe(false);
    expect(httpUrl.safeParse("").success).toBe(false);
  });
});
