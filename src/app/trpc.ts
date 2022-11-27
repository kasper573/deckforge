import { createTRPCReact } from "@trpc/react-query";
import { QueryClient } from "@tanstack/react-query";
import { httpBatchLink, loggerLink } from "@trpc/client";
import { type inferRouterInputs, type inferRouterOutputs } from "@trpc/server";
import superjson from "superjson";
import type { ApiRouter } from "../api/router";
import { env } from "./env";

export const trpc = createTRPCReact<ApiRouter>();

export const queryClient = new QueryClient();

export function createTRPCClient(getBearerToken: () => string | undefined) {
  return trpc.createClient({
    transformer: superjson,
    links: [
      loggerLink({
        enabled(opts) {
          const canUseLoggerLink =
            opts.direction === "down" && opts.result instanceof Error;
          return canUseLoggerLink && env.enableLoggerLink;
        },
      }),
      httpBatchLink({
        url: getApiBaseUrl(),
        headers() {
          const token = getBearerToken();
          return token ? { Authorization: "Bearer " + token } : {};
        },
      }),
    ],
  });
}

function getApiBaseUrl() {
  return `//${window.location.hostname}${
    env.apiPort ? `:${env.apiPort}` : ""
  }/api`;
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
