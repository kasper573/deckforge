import { z } from "zod";

export const zodNumeric = z
  .string()
  .regex(/^[\d,.]+$/)
  .transform(parseFloat);
