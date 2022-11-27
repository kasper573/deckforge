import { z } from "zod";

export type AuthImplementation = z.infer<typeof authImplementationType>;
export const authImplementationType = z.enum(["real", "fake"]);