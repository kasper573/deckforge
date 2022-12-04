import * as jwt from "jsonwebtoken";
import * as bcrypt from "bcrypt";
import type express from "express";
import { Result } from "@badrap/result";
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
  function sign(payload: JWTUser) {
    return jwt.sign(payload, jwtSecret, { expiresIn: jwtLifetime });
  }

  function check(req: express.Request) {
    const header = (req.headers.Authorization ?? req.headers.authorization) as
      | string
      | undefined;
    if (!header) {
      return Result.err(new Error("Missing authorization header"));
    }

    const [scheme, token] = header.split(" ");
    if (scheme !== "Bearer") {
      return Result.err(new Error("Invalid authorization scheme"));
    }

    try {
      const decoded = jwt.decode(token, { complete: true });
      if (!decoded) {
        return Result.err(new Error("Failed to decode token"));
      }
      jwt.verify(token, jwtSecret, { algorithms: jwtAlgorithms });
      return Result.ok(decoded.payload as JWTUser);
    } catch (err) {
      return Result.err(err instanceof Error ? err : new Error("Invalid token"));
    }
  }

  function createPasswordHash(plain: string) {
    return bcrypt.hash(plain, hashSaltRounds);
  }

  function verifyPassword(plain: string, hash: string) {
    return bcrypt.compare(plain, hash);
  }

  return {
    sign,
    check,
    createPasswordHash,
    verifyPassword,
  };
}

export type Authenticator = ReturnType<typeof createAuthenticator>;
