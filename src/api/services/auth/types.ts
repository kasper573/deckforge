import { z } from "zod";
import type { UserRole } from "@prisma/client";

export type AuthImplementation = z.infer<typeof authImplementationType>;
export const authImplementationType = z.enum(["real", "fake"]);

export interface AuthContext {
  id: string;
  name: string;
  role: UserRole;
}
