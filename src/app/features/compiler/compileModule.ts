import { transform as jsToES5 } from "@babel/standalone";
import type { AnyFunction } from "js-interpreter";
import JSInterpreter from "js-interpreter";
import type { z, ZodType } from "zod";
import { ZodFunction, ZodObject } from "zod";
import type { ErrorDecorator } from "../../../lib/wrapWithErrorDecorator";
import { wrapWithErrorDecorator } from "../../../lib/wrapWithErrorDecorator";
import { LogSpreadError } from "../editor/components/LogList";
import type { RuntimeGenerics } from "./types";

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
  scriptAPI?: object;
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
>(
  code: string,
  { type, scriptAPI = {} }: CompileModuleOptions<T, G>
): CompileModuleResult<T> {
  const callFnName = "___call___";
  const definitionVariable = "___def___";

  const bridgeCode = `
    let ${definitionVariable};
    ${generateNativeBridgeCode(scriptAPI, callFnName)}
    function ${moduleCompilerSymbols.defineName}(definition) {
      ${definitionVariable} = definition;
    }
  `;

  let interpreter: JSInterpreter;
  try {
    code = transpile(`${bridgeCode}\n${code}`);
    interpreter = new JSInterpreter(code, (i, globals) => {
      i.setProperty(globals, callFnName, i.createNativeFunction(call));
    });
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

  function call(payload: string) {
    const [path, args] = JSON.parse(payload) as [string[], unknown[]];
    const fn = path.reduce(
      (obj, key) => obj[key as keyof typeof obj],
      scriptAPI as object
    );
    if (typeof fn !== "function") {
      throw new Error(`"${path.join(".")}" is not a function`);
    }
    return JSON.stringify(fn(...args));
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

function generateNativeBridgeCode(scriptAPI: object, callFnName: string) {
  return Object.entries(scriptAPI)
    .map(
      ([key, value]) => `const ${key} = ${valueToJS(value, callFnName, [key])};`
    )
    .join("\n");
}

function valueToJS(
  value: unknown,
  callFnName: string,
  path: Array<string | number>
): string {
  const chain = (child: unknown, step: string | number) =>
    valueToJS(child, callFnName, [...path, step]);

  if (Array.isArray(value)) {
    return `[${value.map(chain).join(", ")}]`;
  }
  if (typeof value === "object" && value !== null) {
    return `{${Object.entries(value)
      .map(([key, child]) => `${JSON.stringify(key)}: ${chain(child, key)}`)
      .join(", ")}}`;
  }
  if (typeof value === "function") {
    return `function () {
      const path = ${JSON.stringify(path)};
      const args = Array.prototype.slice.call(arguments); 
      const result = ${callFnName}(JSON.stringify([path, args]));
      return result !== undefined ? JSON.parse(result) : undefined; 
    }`;
  }
  return JSON.stringify(value);
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
  }
  return a;
}
