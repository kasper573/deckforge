import type { UserRole } from "@prisma/client";

export const fake = {
  token: "fake",
  user: {
    id: "fake",
    name: "Fake",
    role: "User" as UserRole,
  },
};
