import type { AnyFunction } from "js-interpreter";
import JSInterpreter from "js-interpreter";
import type { ZodRawShape, ZodType } from "zod";
import { ZodFunction, ZodObject, z } from "zod";
import type { Result } from "neverthrow";
import { err, ok } from "neverthrow";
import { ModuleKind, ScriptTarget, transpileModule } from "typescript";
import { normalizeType } from "../../../lib/zod-extensions/zodNormalize";

export type AnyModuleOutputType = ZodType<ModuleOutput>;
export type ModuleOutput = ModuleOutputRecord | ModuleOutputFunction;
export type ModuleOutputFunction = AnyFunction;
export type ModuleOutputRecord = Partial<Record<string, ModuleOutputFunction>>;

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
export type ModuleErrorFactory = (error: unknown) => unknown;

export interface CompileModulesOptions {
  createError?: ModuleErrorFactory;
}

export class ModuleCompiler {
  #modules?: CompiledModules;
  #definitions: ModuleDefinitions = {};

  constructor(private options: CompileModulesOptions = {}) {}

  addModule<Name extends string, Definition extends ModuleDefinition>(
    name: Name,
    definition: Definition
  ) {
    assertValidIdentifier(name);
    this.#definitions[name] = definition;

    return createModuleProxy(name, definition, (_, functionName, args) => {
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

  refs = ModuleReferences.create;

  compile() {
    const result = compileModules(this.#definitions, this.options);
    if (result.isOk()) {
      this.#modules = result.value;
    }
    return result;
  }

  dispose() {}
}

export function compileModules<Definitions extends ModuleDefinitions>(
  definitions: Definitions,
  {
    createError: createErrorImpl = (error) => error,
  }: CompileModulesOptions = {}
): Result<CompiledModules<Definitions>, unknown> {
  const createError: ModuleErrorFactory = (error) =>
    createErrorImpl(bridgeErrorProtocol.parse(error));

  let code: string;
  try {
    code = transpile(`
    ${createBridgeCode()}
    ${Object.entries(definitions)
      .map((args) => createModuleCode(...args))
      .join("\n")}
  `);
  } catch (error) {
    return err(createError(error));
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
    return err(createError(error));
  }

  function flush() {
    const hasMore = interpreter.run();
    if (hasMore) {
      throw createError("Script did not resolve immediately");
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
      throw createError(
        `"${[moduleName, ...path].join(".")}" is not a global function`
      );
    }
    const returns = fn(...args);
    return JSON.stringify({ args, returns });
  }

  function callDefined(
    moduleName: string,
    functionName: string | undefined,
    args: unknown[]
  ) {
    const invocationCode = createInvocationCode(moduleName, functionName, args);
    try {
      interpreter.appendCode(invocationCode);
      flush();
    } catch (error) {
      throw createError(error);
    }

    const result = z
      .object({ args: z.array(z.unknown()), returns: z.unknown() })
      .parse(JSON.parse(interpreter.value as string));
    mutate(args, result.args);
    return result.returns;
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

function createModuleCode(
  moduleName: string,
  { code, type, globals }: ModuleDefinition
) {
  if (zodInstanceOf(type, ZodFunction)) {
    return `(function define_${moduleName} (${symbols.define}) {
        ${bridgeGlobals(moduleName, globals)}
        ${symbols.define}(${defaultDefinitionCode(type)});
        ${enhanceErrorCode(code)}
      })((def) => {
        const enhancedDef = function call_${moduleName} (...args) {
          ${enhanceErrorCode("return def(...args);")}
        };
        ${symbols.define}("${moduleName}", enhancedDef);
      });
    `;
  }

  if (zodInstanceOf(type, ZodObject)) {
    return `(function define_${moduleName} (${symbols.define}) {
        ${bridgeGlobals(moduleName, globals)}
        ${symbols.define}({});
        ${enhanceErrorCode(code)}
      })((def) => {
        const defaults = ${defaultDefinitionCode(type)};
        ${symbols.define}("${moduleName}", {...defaults, ...def});
      });
    `;
  }

  throw new Error("Unsupported module type");
}

function enhanceErrorCode(code: string) {
  return `
    try {
      ${code}
    } catch (error) {
      if (error.name === "BridgeError") {
        throw error;
      }
      error = new Error(String(error?.stack ?? error));
      error.name = "BridgeError";
      throw error;
    }
  `;
}

function defaultDefinitionCode(type: ZodType): string {
  if (zodInstanceOf(type, ZodObject)) {
    return `{
      ${Object.entries(type.shape as ZodRawShape)
        .map(([key, value]) => `${key}: ${defaultDefinitionCode(value)}`)
        .join(",")}
    }`;
  }
  if (zodInstanceOf(type, ZodFunction)) {
    return `() => {}`;
  }
  throw new Error("Unsupported module type");
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
    functionName: string | undefined
  ) {
    type Fn = z.infer<T>;
    function moduleFunctionProxy(...args: Parameters<Fn>): ReturnType<Fn> {
      return handleProxyCall(moduleName, functionName, args) as ReturnType<Fn>;
    }
    return moduleFunctionProxy;
  }

  if (zodInstanceOf(type, ZodObject)) {
    const proxies = Object.keys(type.shape).reduce(
      (acc: ModuleOutputRecord, key) => ({
        ...acc,
        [key]: createFunctionProxy(moduleName, key),
      }),
      {}
    );
    return proxies;
  }

  if (zodInstanceOf(type, ZodFunction)) {
    return createFunctionProxy(moduleName, undefined);
  }

  throw new Error("Unsupported module type");
}

function createInvocationCode(
  moduleName: string,
  functionName: string | undefined,
  args: unknown[]
) {
  const description = functionName
    ? `${moduleName}_${functionName}`
    : moduleName;
  return `(function invocation_${description}() {
    return ${symbols.callDefined}("${moduleName}", ${
    functionName ? `"${functionName}"` : "undefined"
  }, ${JSON.stringify(args)});
  })()`;
}

function createBridgeCode() {
  return `
    const ${symbols.modules} = {};
    const ${symbols.mutate} = (${createMutateFn.toString()})();
    function ${symbols.callDefined}(moduleName, functionName, args) {
      ${enhanceErrorCode(`
        const m = ${symbols.modules}[moduleName];
        const fn = functionName ? m[functionName] : m;
        const returns = fn.apply(null, args);
        return JSON.stringify({ args, returns });
      `)}
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

function bridgeGlobals(moduleName: string, globals: object = {}): string {
  const rootKeys = Object.keys(globals);
  if (rootKeys.length === 0) {
    return "";
  }

  return [
    `const globals = ${bridgeJSValue(moduleName, globals)}`,
    ...rootKeys.map((key) => `const ${key} = globals["${key}"]`),
  ].join(";\n");
}

function bridgeJSValue(
  moduleName: string,
  value: unknown,
  path: Array<string | number> = []
): string {
  const chain = (child: unknown, step: string | number) =>
    bridgeJSValue(moduleName, child, [...path, step]);

  if (value instanceof ModuleReferences) {
    return `{${Object.entries(value)
      .map(
        ([moduleIdentifier, moduleName]) =>
          `get ${assertValidIdentifier(moduleIdentifier)} () { 
            return ${symbols.modules}["${moduleName}"];
          }`
      )
      .join(", ")}}`;
  }
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
  const result = transpileModule(`${polyfill}\n${code}`, {
    compilerOptions: {
      target: ScriptTarget.ES5,
      module: ModuleKind.CommonJS,
    },
  });
  return result.outputText;
}

const polyfill = `
  Array.prototype.find ??= function (predicate) {
    for (let i = 0; i < this.length; i++) {
      if (predicate(this[i])) {
        return this[i];
      }
    }
  }
`;

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
      for (const key of Object.keys(b)) {
        const nextValue = mutate(a[key], b[key]);
        try {
          a[key] = nextValue;
        } catch {
          // ignore read-only errors
        }
      }
      return a;
    }
    return b;
  };

  function isObject(obj: unknown): obj is Record<string, unknown> {
    return obj !== null && typeof obj === "object";
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

const bridgeErrorProtocol = z.any().transform((error): unknown => {
  try {
    return z
      .object({ error: z.unknown() })
      .parse(JSON.parse(error instanceof Error ? error.message : error)).error;
  } catch {
    return error;
  }
});

export const validIdentifier = (str: string) =>
  str.replace(/[^a-zA-Z0-9_]/g, "_");

function assertValidIdentifier(str: string) {
  const valid = validIdentifier(str);
  if (valid !== str) {
    throw new Error(`Invalid identifier: ${str}`);
  }
  return valid;
}

function zodInstanceOf<OfType extends ZodType>(
  type: ZodType,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ofType: new (...args: any[]) => OfType
): type is OfType {
  type = normalizeType(type);
  return type instanceof ofType;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyZodFunction = ZodFunction<any, any>;

export class ModuleReferences implements Record<string, string> {
  [x: string]: string;

  constructor(definition: Readonly<Record<string, string>>) {
    Object.assign(this, definition);
  }

  static create(names: string[] | Record<string, string>) {
    return new ModuleReferences(
      Array.isArray(names)
        ? Object.fromEntries(names.map((name) => [name, name]))
        : names
    );
  }
}
