import { z } from "zod";
import { brandName } from "./zodToTS";

export const zodRuntimeBranded = <Token extends string>(name: Token) => {
  const brand = z.string().brand();
  if (name) {
    Object.defineProperty(brand, brandName, { value: name });
  }
  return brand as unknown as z.ZodLiteral<`Brand[${Token}]`>;
};
