import type { ZodTuple } from "zod/lib/types";
import { ZodFunction } from "zod";
import type { ZodType } from "zod";
import type { z } from "zod";
import { normalizeType } from "./zodNormalize";
import { zodInstanceOf } from "./zodInstanceOf";

export function safeFunctionParse<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Args extends ZodTuple<any, any>,
  Returns extends ZodType
>(type: ZodType, value: unknown, name?: string) {
  type = normalizeType(type);

  if (typeof value !== "function") {
    throw new Error(
      `Expected value to be a function, but got ${typeof value} instead.`
    );
  }

  if (!zodInstanceOf(type, ZodFunction)) {
    throw new Error(
      `Expected type to be a function, but got ${type.constructor.name} instead.`
    );
  }

  name = name ?? value.name;
  const argsType = type._def.args;
  const returnType = type._def.returns;
  const description = name ? `function "${name}"` : "function";
  const argCount = argsType._def.items.length;

  return (...args: z.infer<Args>): z.infer<Returns> => {
    args.splice(argCount);

    const argsParseResult = argsType.safeParse(args);
    if (!argsParseResult.success) {
      throw new Error(
        `Failed to invoke ${description}, invalid arguments:\n` +
          argsParseResult.error.issues
            .map(
              (issue, index) =>
                `#${index + 1}: ${issue.message} (path: ${issue.path.join(
                  "."
                )})`
            )
            .join("\n")
      );
    }

    const result = value(...args);

    const returnParseResult = returnType.safeParse(result);

    if (!returnParseResult.success) {
      throw new Error(
        `Safely invoked ${description} had invalid return type:\n` +
          returnParseResult.error.issues
            .map((issue) => issue.message)
            .join(", ")
      );
    }

    return result;
  };
}
