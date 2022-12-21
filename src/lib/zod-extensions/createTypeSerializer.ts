import type { ZodRawShape, ZodType } from "zod";
import { z } from "zod";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type TypeName = keyof any;

export type SerializedType<TN extends TypeName = TypeName> =
  | TN
  | SerializedObject<TN>;

export type SerializedObject<TN extends TypeName = TypeName> = {
  [key: string]: SerializedType<TN>;
};

export type TypeOf<
  ST extends SerializedType<keyof Types>,
  Types extends TypeMap
> = ST extends SerializedObject
  ? TypeOfObject<ST, Types>
  : ST extends keyof Types
  ? Types[ST]
  : never;

export type ValueTypeOf<
  ST extends SerializedType<keyof Types>,
  Types extends TypeMap
> = ZodType<TypeOf<ST, Types>>;

type TypeOfObject<
  Def extends SerializedObject<keyof Types>,
  Types extends TypeMap
> = {
  [K in keyof Def]: TypeOf<Def[K], Types>;
};

export type TypeOfShape<T extends ZodRawShape> = {
  [K in keyof T]: z.infer<T[K]>;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TypeMap<TN extends TypeName = TypeName> = Record<TN, any>;

export function createSerializableType<TypeSchemas extends ZodRawShape>(
  primitiveTypes: TypeSchemas,
  defaults: TypeOfShape<TypeSchemas>
) {
  type Types = TypeOfShape<TypeSchemas>;
  type TN = keyof TypeSchemas;
  type ST = SerializedType<TN>;
  type SO = SerializedObject<TN>;

  const typeNames = Object.keys(primitiveTypes) as TN[];
  if (typeNames.length === 0) {
    throw new Error("No types provided");
  }

  const typeName: ZodType<TN> = z.enum(typeNames as never);
  const obj: ZodType<SO> = z.record(z.lazy(() => serializedType));
  const serializedType: ZodType<ST> = typeName.or(obj);

  function valueTypeOf<T extends ST>(serialized: T): ValueTypeOf<T, Types> {
    if (typeof serialized === "string") {
      return primitiveTypes[serialized].default(
        defaults[serialized]
      ) as ValueTypeOf<T, Types>;
    }

    const object = z
      .object(
        Object.entries(serialized).reduce(
          (shape, [propertyName, value]) => ({
            ...shape,
            [propertyName]: valueTypeOf(value),
          }),
          {} as { [K in keyof T]: ZodType }
        )
      )
      .partial()
      .default({} as never);

    return object as unknown as ZodType<TypeOf<T, Types>>;
  }

  function isObject<TN extends TypeName>(serialized: SerializedType<TN>) {
    return typeof serialized === "object";
  }

  function isTypeName<TN extends TypeName>(serialized: SerializedType<TN>) {
    return typeof serialized === "string" && serialized in primitiveTypes;
  }

  function defaultOf<T extends ST>(serialized: T): TypeOf<T, Types> {
    return valueTypeOf(serialized).parse(undefined);
  }

  return { serializedType, valueTypeOf, isObject, defaultOf, isTypeName };
}
