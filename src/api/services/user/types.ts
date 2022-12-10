import { z } from "zod";
import type { User } from "@prisma/client";
import { createPropertyMatchRefiner } from "../../../lib/zod-extensions/zodRefiner";
import type { ZodShapeFor } from "../../../lib/zod-extensions/ZodShapeFor";

export function roleToAccessLevel(role: UserRole): number {
  return userRoleType._def.values.indexOf(role);
}

export const usernameType = z.string().min(6).max(12);
export const passwordType = z.string().min(12).max(36);

export const userType = z.object<ZodShapeFor<User>>({
  userId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  name: usernameType,
  email: z.string().email(),
  passwordHash: z.string(),
  accessLevel: z.number().int(),
});

export type UserRole = z.infer<typeof userRoleType>;
export const userRoleType = z.enum(["Guest", "User", "Admin"]);

const passwordMatcher = createPropertyMatchRefiner(
  "password",
  "passwordConfirm",
  "Passwords do not match"
);

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
  userId: userType.shape.userId,
  access: userType.shape.accessLevel,
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
