import * as jwt from "jsonwebtoken";
import type { Request as JWTRequest } from "express-jwt";
import { expressjwt } from "express-jwt";
import { z } from "zod";
import type express from "express";
import { zodNumeric } from "../../../lib/zod-extensions/zodNumeric";
import type { JWTUser } from "./types";

export function createAuthenticator({
  secret,
  tokenLifetime,
  algorithms,
}: AuthenticatorOptions) {
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
    return auth;
  }

  return {
    sign,
    check,
  };
}

export type Authenticator = ReturnType<typeof createAuthenticator>;

// prettier-ignore
export const algorithmType = z.enum(["HS256", "HS384", "HS512", "RS256", "RS384", "RS512", "PS256", "PS384", "PS512", "ES256", "ES384", "ES512"]);
export type Algorithm = z.infer<typeof algorithmType>;

export type AuthenticatorOptions = z.infer<typeof authenticatorOptionsType>;
export const authenticatorOptionsType = z.object({
  secret: z.string(),
  tokenLifetime: zodNumeric,
  algorithms: z.array(algorithmType),
});

const noop = () => {};
