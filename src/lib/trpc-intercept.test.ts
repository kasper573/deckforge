import type { Server } from "http";
import { initTRPC } from "@trpc/server";
import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import express from "express";
import * as trpcExpress from "@trpc/server/adapters/express";
import { z } from "zod";
import type {
  LinkInterceptors,
  LinkInterceptorsDefinition,
} from "./trpc-intercept";
import { interceptedLink } from "./trpc-intercept";

const t = initTRPC.create();

describe("trpc-intercept", () => {
  let server: Server;
  let client: ReturnType<typeof createClient>;

  beforeEach(async () => {
    const hopefullyFreePort = 2635;
    const deps = createClientAndInterceptor();
    client = deps.client;

    await new Promise<void>((resolve) => {
      server = deps.serverApp.listen(hopefullyFreePort, resolve);
    });
  });

  afterEach(() => server.close());

  it("intercepts client procedure calls", async () => {
    let count = await client.counter.count.query();
    expect(count).toBe(0);

    await client.counter.increase.mutate();
    count = await client.counter.count.query();
    expect(count).toBe(1);
  });
});

function createClientAndInterceptor() {
  const relativeApiPath = "/api";
  const apiBaseUrl = `http://localhost${relativeApiPath}`;
  const api = createApi(5);

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

  const serverApp = createServerApp(api, relativeApiPath);
  const client = createClient(apiBaseUrl, interceptors);

  return { client, serverApp };
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

function createServerApp(router: Api, relativeApiPath: string) {
  const app = express();
  app.use(
    relativeApiPath,
    trpcExpress.createExpressMiddleware({ router: router })
  );
  return app;
}

function createClient(
  url: string,
  interceptors?: LinkInterceptorsDefinition<Api>
) {
  return createTRPCProxyClient<Api>({
    links: [
      interceptedLink(httpBatchLink({ url, fetch: fakeFetch }), interceptors),
    ],
  });
}

function fakeFetch(
  ...params: Parameters<typeof fetch>
): ReturnType<typeof fetch> {
  throw new Error("Fetch not intercepted");
}

type Api = ReturnType<typeof createApi>;
