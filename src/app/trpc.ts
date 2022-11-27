import { createTRPCReact } from "@trpc/react-query";
import { QueryClient } from "@tanstack/react-query";
import { httpBatchLink, loggerLink } from "@trpc/client";
import { type inferRouterInputs, type inferRouterOutputs } from "@trpc/server";
import superjson from "superjson";
import type { ApiRouter } from "../api/router";
import { env } from "./env";

export const trpc = createTRPCReact<ApiRouter>();

export const queryClient = new QueryClient();

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
