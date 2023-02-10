import type { AnyFunction } from "js-interpreter";
import JSInterpreter from "js-interpreter";
import type { ZodType } from "zod";
import { ZodFunction, ZodObject, z } from "zod";
import type { Result } from "neverthrow";
import { err, ok } from "neverthrow";
import { ModuleKind, ScriptTarget, transpileModule } from "typescript";

export type AnyModuleOutputType = ZodType<ModuleOutput>;
export type ModuleOutput = ModuleOutputRecord | ModuleOutputFunction;
export type ModuleOutputFunction = AnyFunction;
export type ModuleOutputRecord = Partial<Record<string, ModuleOutputFunction>>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyZodFunction = ZodFunction<any, any>;

export type CompiledModule<
  Type extends AnyModuleOutputType = AnyModuleOutputType
> = z.infer<Type>;

export type CompiledModules<
  Definitions extends ModuleDefinitions = ModuleDefinitions
> = {
  [Name in keyof Definitions]: CompiledModule<Definitions[Name]["type"]>;
};

export interface ModuleDefinition<
  T extends AnyModuleOutputType = AnyModuleOutputType
> {
  type: T;
  globals?: object;
  code: string;
}

export type ModuleDefinitions = Record<string, ModuleDefinition>;

export class ModuleCompiler {
  #modules?: CompiledModules;
  #definitions: ModuleDefinitions = {};

  constructor(private errorDecorator?: AnyFunction) {}

  addModule<Name extends string, Definition extends ModuleDefinition>(
    name: Name,
    definition: Definition
  ) {
    this.#definitions[name] = definition;
    return createModuleProxy(name, definition, (name, functionName, args) => {
      const m = this.#modules?.[name];
      if (!m) {
        throw new Error("Module not compiled");
      }
      const f = functionName ? m[functionName as keyof typeof m] : m;
      if (typeof f !== "function") {
        throw new Error(
          `Property "${functionName}" is not a function on module "${name}"`
        );
      }
      return f(...args);
    });
  }

  compile() {
    const result = compileModules(this.#definitions);
    if (result.isOk()) {
      this.#modules = result.value;
    }
    return result;
  }

  dispose() {}
}

export function compileModules<Definitions extends ModuleDefinitions>(
  definitions: Definitions
): Result<CompiledModules<Definitions>, unknown> {
  let code: string;
  try {
    code = transpile(`
    ${createBridgeCode()}
    ${createScopedModuleCode(definitions)}
    if (Object.keys(${symbols.modules}).length === 0) {
      throw new Error("No modules were defined");
    }
  `);
  } catch (error) {
    return err(enhancedError(`Transpile error: ${error}`));
  }

  let interpreter: JSInterpreter;
  try {
    interpreter = new JSInterpreter(code, (i, globals) => {
      i.setProperty(
        globals,
        symbols.callNativeRaw,
        i.createNativeFunction(callNativeRaw)
      );
    });
    flush();
  } catch (error) {
    return err(enhancedError(`Compiler error: ${error}`));
  }

  function flush() {
    const hasMore = interpreter.run();
    if (hasMore) {
      throw enhancedError("Script did not resolve immediately");
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
    const moduleRef = `${symbols.modules}["${moduleName}"]`;
    const fnRef = functionName ? `${moduleRef}.${functionName}` : moduleRef;
    const invocationCode = `${symbols.callDefined}(${fnRef}, ${JSON.stringify(
      args
    )})`;
    try {
      interpreter.appendCode(invocationCode);
      flush();
    } catch (error) {
      throw enhancedError(`Runtime error: ${error}`);
    }

    const result = z
      .object({ args: z.array(z.unknown()), returns: z.unknown() })
      .parse(JSON.parse(interpreter.value as string));
    mutate(args, result.args);
    return result.returns;
  }

  function enhancedError(error: unknown) {
    return error;
  }

  const moduleProxies = Object.entries(definitions).reduce(
    (acc, [moduleName, definition]) => ({
      ...acc,
      [moduleName]: createModuleProxy(moduleName, definition, callDefined),
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

function createModuleProxy<Definition extends ModuleDefinition>(
  moduleName: string,
  { type }: Definition,
  handleProxyCall: (
    moduleName: string,
    functionName: string | undefined,
    args: unknown[]
  ) => unknown
): CompiledModule<Definition["type"]> {
  function createFunctionProxy<T extends AnyZodFunction>(
    moduleName: string,
    name: string | undefined
  ) {
    type Fn = z.infer<T>;
    function moduleFunctionProxy(...args: Parameters<Fn>): ReturnType<Fn> {
      return handleProxyCall(moduleName, name, args) as ReturnType<Fn>;
    }
    return moduleFunctionProxy;
  }
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

function createBridgeCode() {
  return `
    const ${symbols.modules} = {};
    const ${symbols.mutate} = (${createMutateFn.toString()})();
    function ${symbols.callDefined}(fn, args) {
      if (typeof fn !== "function") {
        throw new Error("fn is not a function");
      }
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
  const result = transpileModule(code, {
    compilerOptions: {
      target: ScriptTarget.ES5,
      module: ModuleKind.CommonJS,
    },
  });
  return result.outputText;
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
