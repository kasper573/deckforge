import * as jwt from "jsonwebtoken";
import * as bcrypt from "bcrypt";
import type { Request as JWTRequest } from "express-jwt";
import { expressjwt } from "express-jwt";
import type express from "express";
import type { JWTUser } from "./types";

export function createAuthenticator({
  jwtSecret,
  jwtLifetime = 24 * 60 * 60,
  jwtAlgorithms = ["HS256"],
  hashSaltRounds = 10,
}: {
  jwtSecret: string;
  jwtLifetime?: number;
  jwtAlgorithms?: jwt.Algorithm[];
  hashSaltRounds?: number;
}) {
  const middleware = expressjwt({
    secret: jwtSecret,
    algorithms: jwtAlgorithms,
    credentialsRequired: false,
  });

  function sign(payload: JWTUser) {
    return jwt.sign(payload, jwtSecret, { expiresIn: jwtLifetime });
  }

  function check(req: express.Request) {
    return (req as JWTRequest<JWTUser>).auth;
  }

  function createPasswordHash(plain: string) {
    return bcrypt.hash(plain, hashSaltRounds);
  }

  function verifyPassword(plain: string, hash: string) {
    return bcrypt.compare(plain, hash);
  }

  return {
    sign,
    middleware,
    check,
    createPasswordHash,
    verifyPassword,
  };
}

export type Authenticator = ReturnType<typeof createAuthenticator>;
