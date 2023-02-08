import { transform as jsToES5 } from "@babel/standalone";
import type { AnyFunction } from "js-interpreter";
import JSInterpreter from "js-interpreter";
import type { z, ZodType } from "zod";
import { ZodFunction, ZodObject } from "zod";
import type { ErrorDecorator } from "../../../lib/wrapWithErrorDecorator";
import { wrapWithErrorDecorator } from "../../../lib/wrapWithErrorDecorator";
import { LogSpreadError } from "../editor/components/LogList";
import type { RuntimeGenerics, RuntimeModuleAPI } from "./types";

export type ModuleOutputType = ZodType<ModuleOutput>;
export type ModuleOutput = ModuleOutputRecord | ModuleOutputFunction;
export type ModuleOutputFunction = AnyFunction;
export type ModuleOutputRecord = Partial<Record<string, ModuleOutputFunction>>;
export type inferModuleOutput<T extends ModuleOutputType> = z.infer<T>;

export type CompileModuleResult<T extends ModuleOutputType> =
  | { type: "success"; value: inferModuleOutput<T> }
  | { type: "error"; error: unknown };

export interface CompileModuleOptions<
  T extends ModuleOutputType,
  G extends RuntimeGenerics
> {
  type: T;
  scriptAPI: RuntimeModuleAPI<G>;
}

export function compileModuleDescribed<
  T extends ModuleOutputType,
  G extends RuntimeGenerics
>(
  kind: string,
  name: string,
  esnextCode: string,
  options: CompileModuleOptions<T, G>
) {
  const result = compileModule(esnextCode, options);
  const decorateError: ErrorDecorator = (error, path) =>
    error instanceof LogSpreadError
      ? error // Keep the innermost error as-is
      : new LogSpreadError(kind, "(", name, ")", ...path, error);
  if (result.type === "error") {
    throw decorateError(result.error, []);
  }

  return wrapWithErrorDecorator(result.value, decorateError);
}

export function compileModule<
  T extends ModuleOutputType,
  G extends RuntimeGenerics
>(code: string, options: CompileModuleOptions<T, G>): CompileModuleResult<T> {
  try {
    const value = createProcedureInterpreter(code, options.type);
    return { type: "success", value };
  } catch (error) {
    return {
      type: "error",
      error: `Script compile error: ${error}`,
    };
  }
}

function createProcedureInterpreter<T extends ModuleOutputType>(
  proceduresCode: string,
  type: T
): inferModuleOutput<T> {
  const bridgeCode = `
    var ${moduleCompilerSymbols.definitionVariable};
    function ${moduleCompilerSymbols.defineName}(definition) {
      ${moduleCompilerSymbols.definitionVariable} = definition;
    }
    function ${moduleCompilerSymbols.deriveName}(createDefinition) {
      ${moduleCompilerSymbols.defineName}(
        createDefinition(${moduleCompilerSymbols.moduleAPIVariable})
      );
    }
  `;

  const startupCode = transpile(`${bridgeCode}\n${proceduresCode}`);

  const interpreter = new JSInterpreter(startupCode, (i, globals) => {
    i.setProperty(
      globals,
      moduleCompilerSymbols.moduleAPIVariable,
      i.createNativeFunction(() => {})
    );
  });

  flush();

  function flush() {
    const hasMore = interpreter.run();
    if (hasMore) {
      throw new Error("Script did not resolve immediately");
    }
  }

  function invoke(
    name: string | undefined,
    args: unknown[]
  ): { args: unknown[]; returns: unknown } {
    const fnRef = `${moduleCompilerSymbols.definitionVariable}${
      name ? `.${name}` : ""
    }`;
    interpreter.appendCode(`
      var args = ${JSON.stringify(args)};
      var returns = ${fnRef}.apply(null, args);
      JSON.stringify({args: args, returns: returns});
    `);
    flush();
    return JSON.parse(interpreter.value as string);
  }

  function createFunctionProxy<T extends AnyZodFunction>(
    name: string | undefined,
    type: T
  ) {
    type Fn = z.infer<T>;
    function moduleFunctionProxy(...args: Parameters<Fn>): ReturnType<Fn> {
      const result = invoke(name, args);
      mutate(args, result.args);
      return result.returns as ReturnType<Fn>;
    }
    return moduleFunctionProxy;
  }

  if (type instanceof ZodObject) {
    return Object.entries(type.shape as Record<string, AnyZodFunction>).reduce(
      (acc: ModuleOutputRecord, [key, value]) => ({
        ...acc,
        [key]: createFunctionProxy(key, value),
      }),
      {}
    );
  }

  if (type instanceof ZodFunction) {
    return createFunctionProxy(undefined, type);
  }

  throw new Error("Unsupported type");
}

function transpile(code: string) {
  const result = jsToES5(code, { presets: ["es2015"] })?.code;
  if (!result) {
    throw new Error("Failed to transpile code");
  }
  return result;
}

export const moduleCompilerSymbols = {
  definitionVariable: "definitions",
  defineName: "define",
  deriveName: "derive",
  moduleAPIVariable: "moduleAPI",
} as const;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyZodFunction = ZodFunction<any, any>;

function mutate(a: unknown, b: unknown) {
  if (
    typeof a === "object" &&
    a !== null &&
    typeof b === "object" &&
    b !== null
  ) {
    Object.assign(a, b);
  } else if (Array.isArray(a) && Array.isArray(b)) {
    const maxLength = Math.max(a.length, b.length);
    for (let i = 0; i < maxLength; i++) {
      a[i] = mutate(a[i], b[i]);
    }
  }
  return a;
}

function iife(code: string) {
  return `(function(){${code}})();`;
}
