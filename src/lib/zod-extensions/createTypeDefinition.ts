import type { ZodType } from "zod";
import { z } from "zod";

export type PrimitiveName = string;

export type TypeDefinition<PN extends PrimitiveName> =
  | PN
  | PropertiesDefinition<PN>;

export type PropertiesDefinition<PN extends PrimitiveName> = {
  [key: string]: TypeDefinition<PN>;
};

export function createTypeDefinition<PN extends PrimitiveName>(
  primitive: ZodType<PN>
): ZodType<TypeDefinition<PN>> {
  const properties: ZodType<PropertiesDefinition<PN>> = z.record(
    z.string(),
    z.lazy(() => type)
  );

  const type = primitive.or(properties);

  return type;
}
