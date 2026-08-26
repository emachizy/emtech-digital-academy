import { z } from "zod";

/**
 * z.string().url() alone accepts any URL-shaped string, including
 * javascript:/data:/file: URIs — it validates syntax, not scheme. Anywhere
 * a URL is stored and later rendered as <a href>, that's enough for stored
 * XSS (see docs/SECURITY.md). Use this instead for every user-submitted URL
 * that ends up in an href.
 */
export const httpUrl = z
  .string()
  .url()
  .refine((value) => {
    try {
      return ["http:", "https:"].includes(new URL(value).protocol);
    } catch {
      return false;
    }
  }, "Must be a valid http(s) URL");
