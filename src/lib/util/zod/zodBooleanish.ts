import { z } from "zod";

export const zodBooleanish = z
  .any()
  .transform((value) => ["true", "1"].includes(`${value}`.toLowerCase()));
