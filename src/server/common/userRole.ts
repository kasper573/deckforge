import * as zod from "zod";

export type UserRole = zod.infer<typeof userRole>;
export const userRole = zod.enum(["user", "admin"]);
