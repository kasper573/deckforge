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

export type ResolverOf<
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
  types: TypeSchemas,
  defaults: TypeOfShape<TypeSchemas>
) {
  type Types = TypeOfShape<TypeSchemas>;
  type TN = keyof TypeSchemas;
  type ST = SerializedType<TN>;
  type SO = SerializedObject<TN>;

  const typeNames = Object.keys(types) as TN[];
  if (typeNames.length === 0) {
    throw new Error("No types provided");
  }

  const typeName: ZodType<TN> = z.enum(typeNames as never);
  const obj: ZodType<SO> = z.record(z.lazy(() => serializable));
  const serializable: ZodType<ST> = typeName.or(obj);

  function resolverOf<T extends ST>(serialized: T): ResolverOf<T, Types> {
    if (typeof serialized === "string") {
      return types[serialized].default(defaults[serialized]) as ResolverOf<
        T,
        Types
      >;
    }

    const object = z
      .object(
        Object.entries(serialized).reduce(
          (shape, [propertyName, value]) => ({
            ...shape,
            [propertyName]: resolverOf(value),
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

  function isTypeName(serialized: ST): serialized is TN {
    return typeof serialized === "string" && serialized in types;
  }

  function assert(value: unknown, serialized: ST) {
    return resolverOf(serialized).parse(value);
  }

  return { serializable, resolverOf, isObject, assert, isTypeName };
}
