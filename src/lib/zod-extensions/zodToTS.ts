import type { ZodRawShape, ZodType } from "zod";
import {
  ZodAny,
  ZodArray,
  ZodBigInt,
  ZodBoolean,
  ZodDate,
  ZodDefault,
  ZodEffects,
  ZodEnum,
  ZodFunction,
  ZodIntersection,
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
  ZodString,
  ZodTuple,
  ZodUndefined,
  ZodUnion,
  ZodUnknown,
  ZodVoid,
} from "zod";
import { memoize } from "lodash";

export interface ZodToTSOptions {
  customLiterals: Map<ZodType, string>;
  indentation: number;
}

export function zodToTS(
  type: ZodType,
  { indentation = 1, customLiterals = noLiterals }: Partial<ZodToTSOptions> = {}
): string {
  return zodToTSImpl(type, { indentation, customLiterals });
}

const noLiterals = new Map<ZodType, string>();

function zodToTSImpl(type: ZodType, options: ZodToTSOptions): string {
  const zodToTS = (type: ZodType) =>
    zodToTSImpl(type, { ...options, indentation: options.indentation + 1 });

  const customLiteral = options.customLiterals.get(type);
  if (customLiteral !== undefined) {
    return customLiteral;
  }

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
    const propertyStrings = properties.map(
      ([propName, propType]) =>
        `${indent(options.indentation)}${propName}: ${zodToTS(propType)}`
    );
    switch (propertyStrings.length) {
      case 0:
        return "{}";
      case 1:
        return `{ ${propertyStrings[0].trim()} }`;
      default:
        return `{\n${propertyStrings.join(";\n")}\n}`;
    }
  }
  if (type instanceof ZodFunction) {
    return `(...args: ${zodToTS(type._def.args)}) => ${zodToTS(
      type._def.returns
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
    return type._def.options.map(zodToTS).join(" | ");
  }
  if (type instanceof ZodIntersection) {
    return `${zodToTS(type._def.left)} & ${zodToTS(type._def.right)}`;
  }

  throw new Error(
    `Unsupported type: ${"typeName" in type._def ? type._def.typeName : type}`
  );
}

const indent = memoize((indentation: number) => "\t".repeat(indentation));
