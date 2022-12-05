import * as jwt from "jsonwebtoken";
import * as bcrypt from "bcrypt";
import type express from "express";
import { TRPCError } from "@trpc/server";
import { env } from "../../env";
import type { JWTUser } from "./types";
import { badTokenMessage } from "./constants";

export function createAuthenticator() {
  const jwtSecret = env.jwtSecret;
  const jwtLifetime = 24 * 60 * 60;
  const jwtAlgorithms = ["HS256" as const];
  const hashSaltRounds = 10;

  function sign(payload: JWTUser) {
    return jwt.sign(payload, jwtSecret, { expiresIn: jwtLifetime });
  }

  function check(req: express.Request): JWTUser | undefined {
    const header = (req.headers.Authorization ?? req.headers.authorization) as
      | string
      | undefined;
    if (!header) {
      return;
    }

    const [scheme, token] = header.split(" ");
    if (scheme !== "Bearer") {
      return;
    }

    try {
      const decoded = jwt.decode(token, { complete: true });
      if (decoded) {
        jwt.verify(token, jwtSecret, { algorithms: jwtAlgorithms });
        return decoded.payload as JWTUser;
      }
    } catch {}

    throw new TRPCError({ code: "UNAUTHORIZED", message: badTokenMessage });
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
