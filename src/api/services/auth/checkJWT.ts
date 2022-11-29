import type { GetVerificationKey, Request as JWTRequest } from "express-jwt";
import { expressjwt } from "express-jwt";
import { expressJwtSecret } from "jwks-rsa";
import type { NextFunction, Response } from "express";
import { env } from "../../env";
import { fake } from "./fake";

export const createJWTMiddleware = {
  real: createRealMiddleware,
  fake: createFakeMiddleware,
}[env.authImplementation];

function createRealMiddleware() {
  return expressjwt({
    secret: expressJwtSecret({
      cache: true,
      rateLimit: true,
      jwksRequestsPerMinute: env.jwks.requestsPerMinute,
      jwksUri: env.jwks.uri,
    }) as GetVerificationKey,
    audience: env.jwt.audience,
    issuer: env.jwt.issuer,
    algorithms: env.jwt.algorithms,
  });
}

function createFakeMiddleware() {
  return (req: JWTRequest, res: Response, next: NextFunction) => {
    if (req.header("Authorization") === `Bearer ${fake.token}`) {
      req.auth = fake.user;
    }
  };
}
