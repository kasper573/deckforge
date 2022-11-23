import type { UserRole } from "@prisma/client";

export function getAccessLevel(role: UserRole): number {
  return accessLevels[role];
}

const accessLevels: Record<UserRole, number> = {
  Guest: 0,
  User: 1,
  Admin: 2,
};
