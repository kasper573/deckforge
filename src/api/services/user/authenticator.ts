import * as jwt from "jsonwebtoken";
import type { Request as JWTRequest } from "express-jwt";
import { expressjwt } from "express-jwt";
import type express from "express";
import type { JWTUser } from "./types";

export function createAuthenticator({
  secret,
  tokenLifetime = 24 * 60 * 60,
  algorithms = ["HS256"],
}: {
  secret: string;
  tokenLifetime?: number;
  algorithms?: jwt.Algorithm[];
}) {
  const middleware = expressjwt({
    secret,
    algorithms,
    credentialsRequired: false,
  });

  function sign(payload: JWTUser) {
    return jwt.sign(payload, secret, { expiresIn: tokenLifetime });
  }

  function check(req: express.Request) {
    return (req as JWTRequest<JWTUser>).auth;
  }

  return {
    sign,
    middleware,
    check,
  };
}

export type Authenticator = ReturnType<typeof createAuthenticator>;
