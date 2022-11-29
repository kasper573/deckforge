import { createTRPCReact } from "@trpc/react-query";
import { httpBatchLink, loggerLink } from "@trpc/client";
import { type inferRouterInputs, type inferRouterOutputs } from "@trpc/server";
import superjson from "superjson";
import type { ApiRouter } from "../api/router";
import { env } from "./env";

export const trpc = createTRPCReact<ApiRouter>({
  // Invalidate any and all queries whenever a mutation is performed
  // This is to emulate the automatic invalidation that rtk-query would provide (which is what we would want).
  // But tRPC has no rtk-query bindings, so instead we have to make to with this solution for react-query.
  unstable_overrides: {
    useMutation: {
      async onSuccess(opts) {
        await opts.originalFn();
        await opts.queryClient.invalidateQueries();
      },
    },
  },
});

export function createTRPCClient(getBearerToken: () => Promise<string>) {
  return trpc.createClient({
    transformer: superjson,
    links: [
      loggerLink({
        enabled: () => env.enableLoggerLink,
        console: {
          log: console.info,
          error: console.error,
        },
      }),
      httpBatchLink({
        url: getApiBaseUrl(),
        async headers() {
          try {
            const token = await getBearerToken();
            return { Authorization: "Bearer " + token };
          } catch {
            return {};
          }
        },
      }),
    ],
  });
}

function getApiBaseUrl() {
  const isNon80 = (env.apiPort ?? 80) !== 80;
  return `//${window.location.hostname}${isNon80 ? `:${env.apiPort}` : ""}/api`;
}

/**
 * Inference helper for inputs
 * @example type HelloInput = RouterInputs['example']['hello']
 **/
export type RouterInputs = inferRouterInputs<ApiRouter>;
/**
 * Inference helper for outputs
 * @example type HelloOutput = RouterOutputs['example']['hello']
 **/
export type RouterOutputs = inferRouterOutputs<ApiRouter>;
