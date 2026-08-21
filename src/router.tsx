import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    // `auth` is a placeholder here — the root route's own beforeLoad
    // resolves the real value from the session cookie on every request.
    context: { queryClient, auth: null },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
  });

  return router;
};
