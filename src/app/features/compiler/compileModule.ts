import type { z, ZodType } from "zod";
import { transform } from "@babel/standalone";
import JSInterpreter from "js-interpreter";
import type { ErrorDecorator } from "../../../lib/wrapWithErrorDecorator";
import { wrapWithErrorDecorator } from "../../../lib/wrapWithErrorDecorator";
import { LogSpreadError } from "../editor/components/LogList";
import type { RuntimeGenerics, RuntimeScriptAPI } from "./types";

export type CompileModuleResult<T extends ZodType> =
  | { type: "success"; value: z.infer<T> }
  | { type: "error"; error: unknown };

export interface CompileModuleOptions<
  T extends ZodType,
  G extends RuntimeGenerics
> {
  type: T;
  scriptAPI: RuntimeScriptAPI<G>;
  initialValue?: z.infer<T>;
}

export function compileModuleDescribed<
  T extends ZodType,
  G extends RuntimeGenerics
>(kind: string, name: string, ...args: Parameters<typeof compileModule<T, G>>) {
  const result = compileModule(...args);
  const decorateError: ErrorDecorator = (error, path) =>
    error instanceof LogSpreadError
      ? error // Keep the innermost error as-is
      : new LogSpreadError(kind, "(", name, ")", ...path, error);
  if (result.type === "error") {
    throw decorateError(result.error, []);
  }

  return wrapWithErrorDecorator(result.value, decorateError);
}

export function compileModule<T extends ZodType, G extends RuntimeGenerics>(
  esnextCode: string,
  options: CompileModuleOptions<T, G>
): CompileModuleResult<T> {
  let definition = options.initialValue;

  function define(newDefinition: z.infer<T>) {
    const result = options.type.safeParse(newDefinition);
    if (!result.success) {
      throw new Error(`Invalid script output: ${result.error.message}`);
    }
    // Cannot use parsed data because zod injects destructive behavior on parsed functions.
    // There's no need for using the parsed data anyway, since it's already json.
    // We're just using zod for validation here, not for parsing.
    definition = newDefinition;
  }

  function derive(
    createDefinition: (scriptAPI: RuntimeScriptAPI<G>) => unknown
  ) {
    define(createDefinition(options.scriptAPI));
  }

  const es5Code = transform(esnextCode, { presets: ["es2015"] })?.code;

  if (!es5Code) {
    return { type: "error", error: "Failed to transpile code" };
  }

  try {
    const interpreter = new JSInterpreter(es5Code, (i, globals) => {
      i.setProperty(globals, "define", i.createNativeFunction(define));
      i.setProperty(globals, "derive", i.createNativeFunction(derive));
    });
    const hasMore = interpreter.run();
    if (hasMore) {
      return { type: "error", error: "Script did not resolve immediately" };
    }
    return { type: "success", value: definition };
  } catch (error) {
    return {
      type: "error",
      error: `Script compile error: ${error} while parsing:\n${esnextCode}`,
    };
  }
}
