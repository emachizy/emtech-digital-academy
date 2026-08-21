/**
 * Mock transport layer.
 *
 * Every read in the app goes through `read()`, so swapping mock data for real
 * HTTP calls later means editing only the functions in `src/lib/api/*` —
 * components and hooks stay untouched.
 */
const DEFAULT_LATENCY = 350;

export function read<T>(value: T | (() => T), latency = DEFAULT_LATENCY): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(typeof value === "function" ? (value as () => T)() : value), latency);
  });
}

export function write<T>(value: T, latency = 600): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), latency));
}

export { NotFoundError } from "./errors";
