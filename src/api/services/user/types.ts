import { z } from "zod";
import { createPropertyMatchRefiner } from "../../../lib/zod-extensions/zodRefiner";

export enum UserAccessLevel {
  Guest,
  User,
  Admin,
}

const passwordMatcher = createPropertyMatchRefiner(
  "password",
  "passwordConfirm",
  "Passwords do not match"
);

export const usernameType = z.string().min(6).max(12);
export const passwordType = z.string().min(12).max(36);

export type UserProfileMutation = z.infer<typeof userProfileMutationType>;
export const userProfileMutationType = z
  .object({
    email: z.string().email(),
    password: passwordType.optional(),
    passwordConfirm: passwordType.optional(),
  })
  .refine(...passwordMatcher);

export type UserRegisterPayload = z.infer<typeof userRegisterPayloadType>;
export const userRegisterPayloadType = z
  .object({
    username: usernameType,
    email: z.string().email(),
    password: passwordType,
    passwordConfirm: passwordType,
  })
  .refine(...passwordMatcher);

export type JWTUser = z.infer<typeof jwtUserType>;
export const jwtUserType = z.object({
  id: z.string(),
  access: z.nativeEnum(UserAccessLevel),
  name: usernameType,
});

export type LoginPayload = z.infer<typeof loginPayloadType>;
export const loginPayloadType = z.object({
  username: z.string(),
  password: z.string(),
});

export type LoginResult = z.infer<typeof loginResultType>;
export const loginResultType = z
  .object({
    success: z.literal(true),
    token: z.string(),
    user: jwtUserType,
  })
  .or(
    z.object({
      success: z.literal(false),
      message: z.string(),
    })
  );
