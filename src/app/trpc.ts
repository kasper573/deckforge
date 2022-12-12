import { createTRPCReact } from "@trpc/react-query";
import { httpBatchLink, loggerLink, TRPCClientError } from "@trpc/client";
import { type inferRouterInputs, type inferRouterOutputs } from "@trpc/server";
import superjson from "superjson";
import { QueryClient } from "@tanstack/react-query";
import type { ApiRouter } from "../api/router";
import { isBadTokenError } from "../api/services/user/constants";
import { env } from "./env";

export const CANCEL_INVALIDATE = Symbol("CANCEL_INVALIDATE");

export const trpc = createTRPCReact<ApiRouter>({
  // Invalidate any and all queries whenever a mutation is performed
  // This is to emulate the automatic invalidation that rtk-query would provide (which is what we would want).
  // But tRPC has no rtk-query bindings, so instead we have to make to with this solution for react-query.
  unstable_overrides: {
    useMutation: {
      async onSuccess(opts) {
        const res = await opts.originalFn();
        if (res !== CANCEL_INVALIDATE) {
          await opts.queryClient.invalidateQueries();
        }
      },
    },
  },
});

export function createQueryClient(onBadToken?: () => void) {
  return new QueryClient({
    defaultOptions: {
      queries: {
        suspense: true,
        // 4s to match cypress timeout
        retry: 4,
        retryDelay: 1000,
        onError: handleError,
      },
      mutations: {
        onError: handleError,
      },
    },
  });

  function handleError(error: unknown) {
    if (error instanceof TRPCClientError && isBadTokenError(error)) {
      onBadToken?.();
    }
  }
}

export function createTRPCClient(getAuthToken: () => string | undefined) {
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
        headers() {
          const token = getAuthToken();
          return token ? { Authorization: `Bearer ${token}` } : {};
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
