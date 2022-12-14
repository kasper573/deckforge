import { z } from "zod";

export const zodIdentifier = z
  .string()
  .min(1)
  .max(32)
  .regex(/^[a-zA-Z0-9_]+$/, {
    message: "Invalid identifier. May only contain characters A-Z, 0-9 and _",
  });
