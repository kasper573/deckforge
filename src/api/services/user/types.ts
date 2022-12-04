import { z } from "zod";
import { createPropertyMatchRefiner } from "../../../lib/zod-extensions/zodRefiner";
import { userType } from "../../../../prisma/zod";
import { UserRole } from "../../../../prisma/zod/enums";

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

export type UserProfile = z.infer<typeof userProfileType>;
export const userProfileType = userType.pick({ name: true, email: true });

export type RegisterUserPayload = z.infer<typeof registerUserPayloadType>;
export const registerUserPayloadType = z
  .object({
    name: usernameType,
    email: z.string().email(),
    password: passwordType,
    passwordConfirm: passwordType,
  })
  .refine(...passwordMatcher);

export type UpdateProfilePayload = z.infer<typeof updateProfilePayloadType>;
export const updateProfilePayloadType = z
  .object({
    email: z.string().email(),
    password: passwordType.optional(),
    passwordConfirm: passwordType.optional(),
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

export type LoginSuccess = z.infer<typeof loginSuccessType>;
export const loginSuccessType = z.object({
  token: z.string(),
  user: jwtUserType,
});
