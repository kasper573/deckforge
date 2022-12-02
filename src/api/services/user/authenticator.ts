import * as jwt from "jsonwebtoken";
import type { Request as JWTRequest } from "express-jwt";
import { expressjwt } from "express-jwt";
import type express from "express";
import type { JWTUser } from "./types";

export function createAuthenticator({
  secret,
  tokenLifetime = 24 * 60 * 60,
  algorithms = ["RS256"],
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

  async function check(
    req: express.Request,
    res: express.Response
  ): Promise<JWTUser | undefined> {
    await middleware(req, res, noop);
    const { auth } = req as JWTRequest<JWTUser>;
    console.log("auth", auth);
    return auth;
  }

  return {
    sign,
    check,
  };
}

export type Authenticator = ReturnType<typeof createAuthenticator>;

const noop = () => {};
