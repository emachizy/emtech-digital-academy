import { isNotFound, isRedirect } from "@tanstack/react-router";
import { createStart, createCsrfMiddleware, createMiddleware } from "@tanstack/react-start";
import { setResponseHeader } from "@tanstack/react-start/server";

import { isAppError } from "./lib/api/errors";
import { renderErrorPage } from "./lib/error-page";

const errorMiddleware = createMiddleware().server(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    // Anything that already carries its own status (an h3 HTTPError, a
    // router redirect()/notFound(), or one of our AppError subclasses) is
    // already handled correctly further down the stack — rethrow rather
    // than replacing it with an HTML error page, which would break server
    // function callers expecting a structured RPC error.
    const hasStatus =
      error != null && typeof error === "object" && ("statusCode" in error || "status" in error);
    if (hasStatus || isRedirect(error) || isNotFound(error) || isAppError(error)) {
      throw error;
    }
    console.error(error);
    return new Response(renderErrorPage(), {
      status: 500,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
});

// Start installs this automatically when src/start.ts is absent; defining the
// file opts out, so re-add it explicitly to keep server functions protected
// from cross-site requests.
const csrfMiddleware = createCsrfMiddleware({
  filter: (ctx) => ctx.handlerType === "serverFn",
});

const securityHeadersMiddleware = createMiddleware().server(async ({ next }) => {
  setResponseHeader("X-Content-Type-Options", "nosniff");
  setResponseHeader("X-Frame-Options", "DENY");
  setResponseHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  setResponseHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  return next();
});

// Applies to every createServerFn call. Route guards (beforeLoad) only
// protect page UX — server functions are directly reachable RPC endpoints,
// so this is where unexpected errors get normalized before they can leak
// internal details (a raw Postgres/Supabase message, a stack trace) to the
// client. AppError subclasses (see lib/api/errors.ts) already carry a safe,
// user-facing message, so they pass through untouched; anything else is
// logged server-side and replaced with a generic message.
const functionErrorMiddleware = createMiddleware({ type: "function" }).server(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    if (isRedirect(error) || isNotFound(error) || isAppError(error)) throw error;
    console.error(error);
    throw new Error("Something went wrong. Please try again.");
  }
});

export const startInstance = createStart(() => ({
  requestMiddleware: [errorMiddleware, securityHeadersMiddleware, csrfMiddleware],
  functionMiddleware: [functionErrorMiddleware],
}));
