import { transform as jsToES5 } from "@babel/standalone";
import type { AnyFunction } from "js-interpreter";
import JSInterpreter from "js-interpreter";
import type { ZodType } from "zod";
import { ZodFunction, ZodObject, z } from "zod";

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

export interface CompileModuleOptions<T extends ModuleOutputType> {
  type: T;
  globals?: object;
}

export function compileModule<T extends ModuleOutputType>(
  code: string,
  { type, globals = {} }: CompileModuleOptions<T>
): CompileModuleResult<T> {
  const bridgeCode = `
    let ${symbols.definition};
    const ${symbols.mutate} = (${createMutateFn.toString()})();
    function ${symbols.callDefined}(fn, args) {
      const returns = fn.apply(null, args);
      return JSON.stringify({ args, returns });
    }
    function ${symbols.callNative}(path, args) {
      const payload = JSON.stringify([path, args]); 
      const response = ${symbols.callNativeRaw}(payload);
      const result = JSON.parse(response);
      ${symbols.mutate}(args, result.args);
      return result.returns;
    }
    ${bridgeGlobals(globals)}
    function ${symbols.define}(definition) {
      ${symbols.definition} = definition;
    }
  `;

  let interpreter: JSInterpreter;
  try {
    code = transpile(`${bridgeCode}\n${code}`);
    console.log(code);
    interpreter = new JSInterpreter(code, (i, globals) => {
      i.setProperty(
        globals,
        symbols.callNativeRaw,
        i.createNativeFunction(callNativeRaw)
      );
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

  function callNativeRaw(payload: string) {
    const [path, args] = JSON.parse(payload) as [string[], unknown[]];
    const fn = path.reduce(
      (obj, key) => obj[key as keyof typeof obj],
      globals as object
    );
    if (typeof fn !== "function") {
      throw new Error(`"${path.join(".")}" is not a function`);
    }
    const returns = fn(...args);
    return JSON.stringify({ args, returns });
  }

  function callDefined(name: string | undefined, args: unknown[]) {
    const fnRef = name ? `${symbols.definition}.${name}` : symbols.definition;
    interpreter.appendCode(
      `${symbols.callDefined}(${fnRef}, ${JSON.stringify(args)});`
    );
    flush();
    const result = z
      .object({ args: z.array(z.unknown()), returns: z.unknown() })
      .parse(JSON.parse(interpreter.value as string));
    mutate(args, result.args);
    return result.returns;
  }

  function createFunctionProxy<T extends AnyZodFunction>(name?: string) {
    type Fn = z.infer<T>;
    function moduleFunctionProxy(...args: Parameters<Fn>): ReturnType<Fn> {
      return callDefined(name, args) as ReturnType<Fn>;
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

function bridgeGlobals(globals: object): string {
  return Object.entries(globals)
    .map(([key, value]) => `const ${key} = ${bridgeJSValue(value, [key])}`)
    .join(";\n");
}

function bridgeJSValue(value: unknown, path: Array<string | number>): string {
  const chain = (child: unknown, step: string | number) =>
    bridgeJSValue(child, [...path, step]);

  if (Array.isArray(value)) {
    return `[${value.map(chain).join(", ")}]`;
  }
  if (typeof value === "object" && value !== null) {
    return `{${Object.entries(value)
      .map(([key, child]) => `${JSON.stringify(key)}: ${chain(child, key)}`)
      .join(", ")}}`;
  }
  if (typeof value === "function") {
    return `(...args) => ${symbols.callNative}(${JSON.stringify(path)}, args)`;
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

const mutate = createMutateFn();

function createMutateFn() {
  return function mutate(a: unknown, b: unknown) {
    if (Array.isArray(a) && Array.isArray(b)) {
      const maxLength = Math.max(a.length, b.length);
      for (let i = 0; i < maxLength; i++) {
        a[i] = mutate(a[i], b[i]);
      }
      return a;
    }
    if (isObject(a) && isObject(b)) {
      return Object.assign(a, b);
    }
    return b;
  };

  function isObject(obj: unknown): obj is object {
    return obj !== null && obj?.constructor.name === "Object";
  }
}

export const symbols = {
  define: "define",
  callNativeRaw: "___call_native_raw___",
  callNative: "___call_native___",
  callDefined: "___call_defined___",
  mutate: "___mutate___",
  definition: "___def___",
} as const;
