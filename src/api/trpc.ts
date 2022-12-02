import type { DefaultErrorShape } from "@trpc/server";
import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import { env } from "./env";
import { UserFacingError } from "./utils/UserFacingError";
import type { JWTUser } from "./services/user/types";
import type { DatabaseClient } from "./db";

export const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return env.exposeInternalErrors || error.cause instanceof UserFacingError
      ? shape
      : stripInternalError(shape);
  },
});

function stripInternalError(shape: DefaultErrorShape): DefaultErrorShape {
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
