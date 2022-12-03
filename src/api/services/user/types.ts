import { UserRole } from "@prisma/client";
import { z } from "zod";
import { createPropertyMatchRefiner } from "../../../lib/zod-extensions/zodRefiner";
import { userType } from "../../../../prisma/zod";

export function roleToAccessLevel(role: UserRole): UserAccessLevel {
  switch (role) {
    case UserRole.Admin:
      return UserAccessLevel.Admin;
    case UserRole.User:
      return UserAccessLevel.User;
    case UserRole.Guest:
      return UserAccessLevel.Guest;
  }
}

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

const mutableUserProfileFields = z.object({
  email: z.string().email(),
  password: passwordType,
  passwordConfirm: passwordType,
});

export type RegisterUserPayload = z.infer<typeof registerUserPayloadType>;
export const registerUserPayloadType = z
  .object({ name: usernameType })
  .and(mutableUserProfileFields)
  .refine(...passwordMatcher);

export type UpdateProfilePayload = z.infer<typeof updateProfilePayloadType>;
export const updateProfilePayloadType = mutableUserProfileFields
  .refine(...passwordMatcher)
  .or(mutableUserProfileFields.omit({ password: true, passwordConfirm: true }));

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

export type LoginSuccess = z.infer<typeof loginSuccessType>;
export const loginSuccessType = z.object({
  token: z.string(),
  user: jwtUserType,
});
