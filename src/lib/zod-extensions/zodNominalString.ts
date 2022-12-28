import { z } from "zod";
import type { NominalString } from "../ts-extensions/NominalString";

export const zodNominalString = <T extends NominalString>() =>
  z.string() as unknown as z.ZodLiteral<T>;
