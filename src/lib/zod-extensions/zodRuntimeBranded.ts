import { z, ZodBranded } from "zod";

export const brandNameSymbol = Symbol("brandName");

export const zodRuntimeBranded = <Token extends string>(name: Token) => {
  const brand = z.string().brand();
  if (name) {
    Object.defineProperty(brand, brandNameSymbol, { value: name });
  }
  return brand as unknown as z.ZodLiteral<`Brand[${Token}]`>;
};

export function getBrandName(type: z.ZodTypeAny) {
  if (type instanceof ZodBranded && brandNameSymbol in type) {
    return String(type[brandNameSymbol]);
  }
}
