import type { GetVerificationKey, Request as JWTRequest } from "express-jwt";
import { expressjwt } from "express-jwt";
import { expressJwtSecret } from "jwks-rsa";
import type { NextFunction, Response } from "express";
import { env } from "../../env";
import type { AuthContext } from "./types";

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
  return (req: JWTRequest<AuthContext>, res: Response, next: NextFunction) => {
    if (req.header("Authorization") === "Bearer fake") {
      req.auth = {
        name: "Fake",
        id: "fake",
        role: "User",
      };
    }
  };
}
