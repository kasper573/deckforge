import type { DefaultErrorShape } from "@trpc/server";
import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";
import { env } from "./env";
import { UserFacingError } from "./utils/UserFacingError";
import type { JWTUser } from "./services/user/types";
import type { DatabaseClient } from "./db";

export const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error: { cause } }) {
    const zodError = cause instanceof ZodError ? cause.flatten() : null;
    const isUserFacing = cause instanceof UserFacingError || !!zodError;
    const enhancedShape = { ...shape, data: { ...shape.data, zodError } };
    return env.exposeInternalErrors || isUserFacing
      ? enhancedShape
      : stripInternalDetails(enhancedShape);
  },
});

function stripInternalDetails<Shape extends DefaultErrorShape>(
  shape: Shape
): Shape {
  return {
    ...shape,
    message: "Internal Server Error",
    data: {
      ...shape.data,
      path: undefined,
      stack: undefined,
    },
  };
}

export type Context = {
  user?: JWTUser;
  db: DatabaseClient;
};

export type MiddlewareOptions = Parameters<
  Parameters<typeof t.middleware>[0]
>[0];
