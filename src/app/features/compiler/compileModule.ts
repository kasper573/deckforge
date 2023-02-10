import { transform as jsToES5 } from "@babel/standalone";
import type { AnyFunction } from "js-interpreter";
import JSInterpreter from "js-interpreter";
import type { ZodType } from "zod";
import { ZodFunction, ZodObject, z } from "zod";
import type { Result } from "neverthrow";
import { err, ok } from "neverthrow";

export type ModuleOutput = ModuleOutputRecord | ModuleOutputFunction;
export type ModuleOutputFunction = AnyFunction;
export type ModuleOutputRecord = Partial<Record<string, ModuleOutputFunction>>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyZodFunction = ZodFunction<any, any>;

export type CompiledModule<Definition extends ModuleDefinition> = z.infer<
  Definition["type"]
>;

export type CompiledModules<Definitions extends ModuleDefinitions> = {
  [Name in keyof Definitions]: CompiledModule<Definitions[Name]>;
};

export interface ModuleDefinition<T extends ModuleOutput = ModuleOutput> {
  type: ZodType<T>;
  globals?: object;
  code: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ModuleDefinitions = Record<string, ModuleDefinition<any>>;

export class ModuleBuilder<Definitions extends ModuleDefinitions> {
  constructor(private definitions: Definitions) {}

  addModule<Name extends string, Output extends ModuleOutput>(
    name: Name,
    type: ZodType<Output>,
    code: string,
    globals?: object
  ) {
    return new ModuleBuilder({
      ...this.definitions,
      [name]: { type, code, globals },
    } as Definitions & Record<Name, Output>);
  }

  compile() {
    return compileModules(this.definitions);
  }
}

export function createModuleBuilder() {
  return new ModuleBuilder({});
}

export function compileModule<Definition extends ModuleDefinition>(
  code: Definition["code"],
  { type, globals = {} }: Omit<Definition, "code">
): Result<CompiledModule<Definition>, unknown> {
  const result = createModuleBuilder()
    .addModule("main", type, code, globals)
    .compile()
    .map((modules) => modules.main);
}

export function compileModules<Definitions extends ModuleDefinitions>(
  definitions: Definitions
): Result<CompiledModules<Definitions>, unknown> {
  let interpreter: JSInterpreter;
  try {
    const code = transpile(`
      ${createBridgeCode()}
      ${createScopedModuleCode(definitions)}
      if (Object.keys(${symbols.modules}).length === 0) {
        throw new Error("No modules were defined");
      }
    `);
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
    return err(`Script compile error: ${error}`);
  }

  function flush() {
    const hasMore = interpreter.run();
    if (hasMore) {
      throw new Error("Script did not resolve immediately");
    }
  }

  function callNativeRaw(payload: string) {
    const [moduleName, path, args] = JSON.parse(payload) as [
      string,
      string[],
      unknown[]
    ];
    const globals = definitions[moduleName as keyof Definitions]?.globals ?? {};
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

  function callDefined(
    moduleName: string,
    functionName: string | undefined,
    args: unknown[]
  ) {
    const moduleRef = `${symbols.modules}.${moduleName}`;
    const fnRef = functionName ? `${moduleRef}.${functionName}` : moduleRef;
    interpreter.appendCode(
      `(function () {
        if (typeof ${fnRef} === "undefined") {
          throw new Error("${fnRef} is not defined");
        }
        return ${symbols.callDefined}(${fnRef}, ${JSON.stringify(args)});
      })()`
    );
    flush();
    const result = z
      .object({ args: z.array(z.unknown()), returns: z.unknown() })
      .parse(JSON.parse(interpreter.value as string));
    mutate(args, result.args);
    return result.returns;
  }

  function createFunctionProxy<T extends AnyZodFunction>(
    moduleName: string,
    name: string | undefined
  ) {
    type Fn = z.infer<T>;
    function moduleFunctionProxy(...args: Parameters<Fn>): ReturnType<Fn> {
      return callDefined(moduleName, name, args) as ReturnType<Fn>;
    }
    return moduleFunctionProxy;
  }

  function createModuleProxy<Definition extends ModuleDefinition>(
    moduleName: string,
    { type }: Definition
  ): CompiledModule<Definition> {
    if (type instanceof ZodObject) {
      const proxies = Object.keys(type.shape).reduce(
        (acc: ModuleOutputRecord, key) => ({
          ...acc,
          [key]: createFunctionProxy(moduleName, key),
        }),
        {}
      );
      return proxies;
    }

    if (type instanceof ZodFunction) {
      return createFunctionProxy(moduleName, undefined);
    }

    throw new Error("Unsupported module type");
  }

  const moduleProxies = Object.entries(definitions).reduce(
    (acc, [moduleName, definition]) => ({
      ...acc,
      [moduleName]: createModuleProxy(moduleName, definition),
    }),
    {} as CompiledModules<Definitions>
  );

  return ok(moduleProxies);
}

function createScopedModuleCode(definitions: ModuleDefinitions) {
  return Object.entries(definitions)
    .map(
      ([moduleName, { code, globals = {} }]) => `
    ((${symbols.define}) => {
      ${bridgeGlobals(moduleName, globals)}
      ${code}
    })((def) => ${symbols.define}("${moduleName}", def));
  `
    )
    .join("\n");
}

function createBridgeCode() {
  return `
    const ${symbols.modules} = {};
    const ${symbols.mutate} = (${createMutateFn.toString()})();
    function ${symbols.callDefined}(fn, args) {
      const returns = fn.apply(null, args);
      return JSON.stringify({ args, returns });
    }
    function ${symbols.callNative}(moduleName, path, args) {
      const payload = JSON.stringify([moduleName, path, args]); 
      const response = ${symbols.callNativeRaw}(payload);
      const result = JSON.parse(response);
      ${symbols.mutate}(args, result.args);
      return result.returns;
    }
    function ${symbols.define}(moduleName, moduleDefinition) {
      ${symbols.modules}[moduleName] = moduleDefinition;
    }
  `;
}

function bridgeGlobals(moduleName: string, globals: object): string {
  return Object.entries(globals)
    .map(
      ([key, value]) =>
        `const ${key} = ${bridgeJSValue(moduleName, value, [key])}`
    )
    .join(";\n");
}

function bridgeJSValue(
  moduleName: string,
  value: unknown,
  path: Array<string | number>
): string {
  const chain = (child: unknown, step: string | number) =>
    bridgeJSValue(moduleName, child, [...path, step]);

  if (Array.isArray(value)) {
    return `[${value.map(chain).join(", ")}]`;
  }
  if (typeof value === "object" && value !== null) {
    return `{${Object.entries(value)
      .map(([key, child]) => `${JSON.stringify(key)}: ${chain(child, key)}`)
      .join(", ")}}`;
  }
  if (typeof value === "function") {
    return `function () { return ${
      symbols.callNative
    }("${moduleName}", ${JSON.stringify(path)}, arguments); }`;
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
  modules: "___modules___",
} as const;
