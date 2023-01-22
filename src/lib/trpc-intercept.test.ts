import { initTRPC } from "@trpc/server";
import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import { z } from "zod";
import type { LinkInterceptors } from "./trpc-intercept";
import { interceptedLink } from "./trpc-intercept";

const t = initTRPC.create();

describe("trpc-intercept", () => {
  it("intercepts client procedure calls", async () => {
    const client = createClient();
    let count = await client.counter.count.query();
    expect(count).toBe(0);

    await client.counter.increase.mutate();
    count = await client.counter.count.query();
    expect(count).toBe(1);
  });
});

function createClient() {
  const relativeApiPath = "/api";
  const apiBaseUrl = `http://localhost${relativeApiPath}`;

  let interceptorCount = 0;
  const interceptors: LinkInterceptors<Api> = {
    counter: {
      count(multiplier = 1) {
        return interceptorCount * multiplier;
      },
      increase(amount = 1) {
        interceptorCount += amount;
      },
    },
  };

  return createTRPCProxyClient<Api>({
    links: [
      interceptedLink(
        httpBatchLink({ url: apiBaseUrl, fetch: fakeFetch }),
        interceptors
      ),
    ],
  });
}

function createApi(initialCount: number) {
  let count = initialCount;
  return t.router({
    counter: t.router({
      count: t.procedure
        .input(z.number().optional())
        .query(({ input: multiplier = 1 }) => count * multiplier),
      increase: t.procedure
        .input(z.number().optional())
        .mutation(({ input: amount = 1 }) => {
          count += amount;
        }),
    }),
  });
}

function fakeFetch(
  ...params: Parameters<typeof fetch>
): ReturnType<typeof fetch> {
  throw new Error("Fetch not intercepted");
}

type Api = ReturnType<typeof createApi>;
