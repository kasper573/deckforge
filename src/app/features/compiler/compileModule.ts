import { transform as jsToES5 } from "@babel/standalone";
import type { AnyFunction } from "js-interpreter";
import JSInterpreter from "js-interpreter";
import type { z, ZodType } from "zod";
import { ZodFunction, ZodObject } from "zod";
import { v4 } from "uuid";
import type { ErrorDecorator } from "../../../lib/wrapWithErrorDecorator";
import { wrapWithErrorDecorator } from "../../../lib/wrapWithErrorDecorator";
import { LogSpreadError } from "../editor/components/LogList";
import type { RuntimeGenerics, RuntimeModuleAPI } from "./types";

export type ModuleOutputType = ZodType<ModuleOutput>;
export type ModuleOutput = ModuleOutputRecord | ModuleOutputFunction;
export type ModuleOutputFunction = AnyFunction;
export type ModuleOutputRecord = Partial<Record<string, ModuleOutputFunction>>;
export type inferModuleOutput<T extends ModuleOutputType> = z.infer<T>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyZodFunction = ZodFunction<any, any>;

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
>(code: string, { type }: CompileModuleOptions<T, G>): CompileModuleResult<T> {
  const definitionVariable = "def_" + v4().replaceAll("-", "_");

  const bridgeCode = `
    let ${definitionVariable};
    function ${moduleCompilerSymbols.defineName}(definition) {
      ${definitionVariable} = definition;
    }
    function ${moduleCompilerSymbols.deriveName}(createDefinition) {
      ${definitionVariable} = createDefinition({});
    }
  `;

  let interpreter: JSInterpreter;
  try {
    interpreter = new JSInterpreter(transpile(`${bridgeCode}\n${code}`));
    flush();
  } catch (error) {
    return {
      type: "error",
      error: `Script compile error: ${error}`,
    };
  }

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
    const fnRef = `${definitionVariable}${name ? `.${name}` : ""}`;
    interpreter.appendCode(`
      var args = ${JSON.stringify(args)};
      var returns = ${fnRef}.apply(null, args);
      JSON.stringify({args: args, returns: returns});
    `);
    flush();
    return JSON.parse(interpreter.value as string);
  }

  function createFunctionProxy<T extends AnyZodFunction>(name?: string) {
    type Fn = z.infer<T>;
    function moduleFunctionProxy(...args: Parameters<Fn>): ReturnType<Fn> {
      const result = invoke(name, args);
      mutate(args, result.args);
      return result.returns as ReturnType<Fn>;
    }
    return moduleFunctionProxy;
  }

  if (type instanceof ZodObject) {
    const proxies = Object.keys(type.shape).reduce(
      (acc: ModuleOutputRecord, key) => ({
        ...acc,
        [key]: createFunctionProxy(key),
      }),
      {}
    );
    return { type: "success", value: proxies };
  }

  if (type instanceof ZodFunction) {
    return { type: "success", value: createFunctionProxy() };
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
  defineName: "define",
  deriveName: "derive",
} as const;

function mutate(a: unknown, b: unknown) {
  if (Array.isArray(a) && Array.isArray(b)) {
    const maxLength = Math.max(a.length, b.length);
    for (let i = 0; i < maxLength; i++) {
      a[i] = mutate(a[i], b[i]);
    }
  } else if (
    typeof a === "object" &&
    a !== null &&
    typeof b === "object" &&
    b !== null
  ) {
    Object.assign(a, b);
  } else return a;
}
