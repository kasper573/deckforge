import { z } from "zod";

export const codeType = z.string().max(10000);
