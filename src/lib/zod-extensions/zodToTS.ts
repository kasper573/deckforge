import type { ZodRawShape, ZodType } from "zod";
import {
  z,
  ZodAny,
  ZodArray,
  ZodBigInt,
  ZodBoolean,
  ZodBranded,
  ZodDate,
  ZodDefault,
  ZodEffects,
  ZodEnum,
  ZodFunction,
  ZodIntersection,
  ZodLazy,
  ZodLiteral,
  ZodMap,
  ZodNever,
  ZodNull,
  ZodNullable,
  ZodNumber,
  ZodObject,
  ZodOptional,
  ZodPromise,
  ZodRecord,
  ZodSet,
  ZodString,
  ZodTuple,
  ZodUndefined,
  ZodUnion,
  ZodUnknown,
  ZodVoid,
} from "zod";
import { memoize } from "lodash";
import { getBrandName } from "./zodRuntimeBranded";
import { zodInstanceOf } from "./zodInstanceOf";

export interface ZodToTSOptions {
  resolvers?: Map<ZodType, string>;
  allowRootResolution: boolean;
  indentation: number;
}

export function zodToTS(
  type: ZodType,
  {
    indentation = 0,
    allowRootResolution = true,
    ...rest
  }: Partial<ZodToTSOptions> = {}
): string {
  return zodToTSImpl(
    type,
    { indentation, allowRootResolution, ...rest },
    [],
    []
  );
}

function zodToTSImpl(
  type: ZodType,
  options: ZodToTSOptions,
  path: string[],
  ancestors: ZodType[]
): string {
  const isCircular = ancestors.includes(type);
  const allowResolve = ancestors.length > 0 || options.allowRootResolution;
  if (allowResolve) {
    const resolved = options.resolvers?.get(type);
    if (resolved !== undefined) {
      return resolved;
    }
  }

  if (isCircular) {
    throw new Error(
      "Circular dependency without resolution detected at " + path.join(".")
    );
  }

  const zodToTS = (childType: ZodType, childName?: string) =>
    zodToTSImpl(
      childType,
      { ...options, indentation: options.indentation + 1 },
      childName !== undefined ? [...path, childName] : path,
      [...ancestors, type]
    );

  // Direct types
  if (type instanceof ZodString) {
    return "string";
  }
  if (type instanceof ZodNumber) {
    return "number";
  }
  if (type instanceof ZodBoolean) {
    return "boolean";
  }
  if (type instanceof ZodDate) {
    return "Date";
  }
  if (type instanceof ZodBigInt) {
    return "bigint";
  }
  if (type instanceof ZodVoid) {
    return "void";
  }
  if (type instanceof ZodUnknown) {
    return "unknown";
  }
  if (type instanceof ZodNull) {
    return "null";
  }
  if (type instanceof ZodUndefined) {
    return "undefined";
  }
  if (type instanceof ZodNever) {
    return "never";
  }
  if (type instanceof ZodAny) {
    return "any";
  }

  // Variance
  if (type instanceof ZodOptional) {
    return `${zodToTS(type._def.innerType)} | undefined`;
  }
  if (type instanceof ZodEffects) {
    return zodToTS(type.innerType());
  }
  if (type instanceof ZodDefault) {
    return zodToTS(type._def.innerType);
  }
  if (type instanceof ZodNullable) {
    return `${zodToTS(type._def.innerType)} | null`;
  }

  // Compositions
  if (type instanceof ZodObject) {
    const properties = Object.entries(type.shape as ZodRawShape);
    const propertyStrings = properties.map(([propName, propType]) => {
      const [isOptional, typeWithoutOptional] = extractOptional(propType);
      return `${indent(options.indentation + 1)}${propName}${
        isOptional ? "?" : ""
      }: ${zodToTS(typeWithoutOptional, propName)}`;
    });
    switch (propertyStrings.length) {
      case 0:
        return "{}";
      case 1:
        return `{ ${propertyStrings[0].trim()} }`;
      default:
        return `{\n${propertyStrings.join(";\n")}\n${indent(
          options.indentation
        )}}`;
    }
  }
  if (type instanceof ZodFunction) {
    const args = type._def.args as ZodTuple;
    const argTypeStrings = args.items.map((t, i) => zodToTS(t, String(i)));
    const paramStrings = argTypeStrings.map(
      (argTypeString, argIndex) => `arg${argIndex}: ${argTypeString}`
    );

    const spreadAtIndex = getSpreadIndex(type);
    if (spreadAtIndex !== undefined) {
      const typeStr = argTypeStrings[spreadAtIndex] ?? zodToTS(z.unknown());
      const paramStr = `...rest: ${typeStr}`;
      if (paramStrings[spreadAtIndex] === undefined) {
        throw new Error(
          "Spread not possible: No parameter defined at index " + spreadAtIndex
        );
      }
      paramStrings[spreadAtIndex] = paramStr;
    }

    return `(${paramStrings.join(", ")}) => ${zodToTS(
      type._def.returns,
      "returns"
    )}`;
  }
  if (type instanceof ZodPromise) {
    return `Promise<${zodToTS(type._def.type)}>`;
  }
  if (type instanceof ZodEnum) {
    return type._def.values.map((v: unknown) => JSON.stringify(v)).join(" | ");
  }
  if (type instanceof ZodRecord) {
    return `{ [key: string]: ${zodToTS(type._def.valueType)} }`;
  }
  if (type instanceof ZodMap) {
    return `Map<${zodToTS(type._def.keyType)}, ${zodToTS(
      type._def.valueType
    )}>`;
  }
  if (type instanceof ZodSet) {
    return `Set<${zodToTS(type._def.valueType)}>`;
  }
  if (type instanceof ZodLiteral) {
    return JSON.stringify(type._def.value);
  }
  if (type instanceof ZodArray) {
    return `${zodToTS(type._def.type)}[]`;
  }
  if (type instanceof ZodTuple) {
    return `[${type._def.items.map(zodToTS).join(", ")}]`;
  }
  if (type instanceof ZodUnion) {
    return type._def.options
      .map((t: ZodType) =>
        zodInstanceOf(t, ZodFunction) ? `(${zodToTS(t)})` : zodToTS(t)
      )
      .join(" | ");
  }

  if (type instanceof ZodIntersection) {
    return `${zodToTS(type._def.left, "left")} & ${zodToTS(
      type._def.right,
      "right"
    )}`;
  }
  if (type instanceof ZodLazy) {
    return zodToTS(type._def.getter());
  }
  if (type instanceof ZodBranded) {
    const brandName = getBrandName(type);
    if (brandName) {
      return `"Brand[${brandName}]"`;
    }
    throw new Error(
      "Branded types are not supported unless using zodRuntimeBranded. " +
        "Or use the resolvers option and provide manual resolutions for these types."
    );
  }

  throw new Error(
    `Unsupported type: ${"typeName" in type._def ? type._def.typeName : type}`
  );
}

function extractOptional(type: ZodType): [boolean, ZodType] {
  if (type instanceof ZodOptional) {
    return [true, type._def.innerType];
  }
  if (type instanceof ZodLazy) {
    return extractOptional(type._def.getter());
  }
  if (type instanceof ZodEffects) {
    return extractOptional(type.innerType());
  }
  if (type instanceof ZodNullable || type instanceof ZodDefault) {
    return extractOptional(type._def.innerType);
  }
  return [false, type];
}

const indent = memoize((indentation: number) => "\t".repeat(indentation));

export function zodToTSResolver(typeMap: Record<string, ZodType>) {
  const resolvers = recordToInverseMap(typeMap);

  function declare() {
    return add(
      ...Object.entries(typeMap).map(
        ([typeName, type]) =>
          `type ${typeName} = ${zodToTS(type, {
            resolvers,
            allowRootResolution: false,
          })};`
      )
    );
  }

  function resolve(type: ZodType) {
    return zodToTS(type, { resolvers });
  }

  function add(...args: string[]): string {
    return args.join("\n");
  }

  resolve.declare = declare;
  resolve.add = add;

  return resolve;
}

function recordToInverseMap<T>(record: Record<string, T>) {
  const inverseMap = new Map<T, string>();
  for (const [key, value] of Object.entries(record)) {
    inverseMap.set(value, key);
  }
  return inverseMap;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function zodSpreadArgs<T extends ZodFunction<any, any>>(
  fnType: T,
  spreadAtIndex = (fnType._def.args as ZodTuple).items.length - 1
) {
  Object.assign(fnType, { [spreadSymbol]: spreadAtIndex });
  return fnType;
}

const spreadSymbol = Symbol("zodSpread");
const getSpreadIndex = (type: ZodType) =>
  spreadSymbol in type ? (type[spreadSymbol] as number) : undefined;
