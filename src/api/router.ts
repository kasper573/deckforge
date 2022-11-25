import { t } from "./trpc";

export function createApiRouter () {
  return t.router({
    foo: t.procedure.query(() => "foo"),
    bar: t.procedure.query(() => "bar"),
  });
}

export type ApiRouter = ReturnType<typeof createApiRouter>;
