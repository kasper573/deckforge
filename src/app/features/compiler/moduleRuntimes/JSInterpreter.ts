import JSInterpreter from "js-interpreter";
import type { ZodRawShape, ZodType } from "zod";
import { z, ZodFunction, ZodObject } from "zod";
import { err, ok } from "neverthrow";
import { ModuleKind, ScriptTarget, transpileModule } from "typescript";
import { zodInstanceOf } from "../../../../lib/zod-extensions/zodInstanceOf";
import type {
  CompiledModules,
  ModuleCompiler,
  ModuleCompilerOptions,
  ModuleDefinition,
  ModuleDefinitions,
  ModuleOutputRecord,
  ModuleRuntimeOptions,
  ModuleCompilerResult,
} from "./types";
import { ModuleReferences } from "./types";
import { symbols as moduleRuntimeSymbols } from "./symbols";
import { createMutateFn } from "./createMutateFn";

export class JSInterpreterCompiler implements ModuleCompiler {
  #modules?: CompiledModules;
  #definitions: ModuleDefinitions = {};

  constructor(private options: ModuleRuntimeOptions = {}) {}

  addModule<Definition extends ModuleDefinition>(definition: Definition) {
    assertValidIdentifier(definition.name);
    this.#definitions[definition.name] = definition;

    return createModuleProxy(
      definition.name,
      definition,
      (_, functionName, args) => {
        const m = this.#modules?.[definition.name];
        if (!m) {
          throw new Error("Module not compiled");
        }
        const f = functionName ? m[functionName as keyof typeof m] : m;
        if (typeof f !== "function") {
          throw new Error(
            `Property "${functionName}" is not a function on module "${definition.name}"`
          );
        }
        return f(...args);
      }
    );
  }

  refs = ModuleReferences.create;

  compile() {
    const result = compileRuntime(this.#definitions, this.options);
    if (result.isOk()) {
      this.#modules = result.value;
    }
    return result;
  }

  dispose() {}
}

function compileRuntime(
  definitions: ModuleDefinitions,
  { compilerOptions }: ModuleRuntimeOptions = {}
): ModuleCompilerResult {
  const createError = (error: unknown) => bridgeErrorProtocol.parse(error);

  let code: string;
  try {
    code = transpile(
      `
    ${createBridgeCode()}
    ${Object.entries(definitions)
      .map((args) => createModuleCode(...args))
      .join("\n")}
  `,
      compilerOptions
    );
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
    const globals = definitions[moduleName]?.globals ?? {};
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
    const name = invocationName(moduleName, functionName);
    const invocationCode = createInvocationCode(moduleName, functionName, args);
    try {
      interpreter.appendCode(invocationCode);
      flush();
    } catch (error) {
      throw createError(error);
    }

    let payload: unknown;
    try {
      payload = JSON.parse(interpreter.value as string);
    } catch {
      throw createError(
        `${name} did not return a JSON string. Received: ${interpreter.value}`
      );
    }

    const result = z
      .object({ args: z.array(z.unknown()), returns: z.unknown() })
      .safeParse(payload);

    if (!result.success) {
      throw createError(
        `${name} did not return a valid response payload: ` +
          result.error.message
      );
    }

    mutate(args, result.data.args);
    return result.data.returns;
  }

  const moduleProxies = Object.entries(definitions).reduce(
    (acc, [moduleName, definition]) => ({
      ...acc,
      [moduleName]: createModuleProxy(moduleName, definition, callDefined),
    }),
    {} as CompiledModules
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
      })((fn) => {
        function call_${moduleName} (...args) {
          ${enhanceErrorCode("return fn(...args);")}
        };
        ${symbols.define}("${moduleName}", call_${moduleName});
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

function createInvocationCode(
  moduleName: string,
  functionName: string | undefined,
  args: unknown[]
) {
  const name = invocationName(moduleName, functionName);
  return `(function ${name}() {
    return ${symbols.callDefined}("${moduleName}", ${
    functionName ? `"${functionName}"` : "undefined"
  }, ${JSON.stringify(args)});
  })()`;
}

function invocationName(moduleName: string, functionName?: string) {
  return `invocation_${moduleName}${functionName ? `_${functionName}` : ""}`;
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

function transpile(code: string, options?: ModuleCompilerOptions) {
  const result = transpileModule(`${polyfill}${code}`, {
    compilerOptions: {
      target: ScriptTarget.ES5,
      module: ModuleKind.CommonJS,
      ...options,
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

const symbols = {
  ...moduleRuntimeSymbols,
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

const validIdentifier = (str: string) => str.replace(/[^a-zA-Z0-9_]/g, "_");

function assertValidIdentifier(str: string) {
  const valid = validIdentifier(str);
  if (valid !== str) {
    throw new Error(`Invalid identifier: ${str}`);
  }
  return valid;
}

function createModuleProxy<Definition extends ModuleDefinition>(
  moduleName: string,
  { type }: Definition,
  handleProxyCall: (
    moduleName: string,
    functionName: string | undefined,
    args: unknown[]
  ) => unknown
): z.infer<Definition["type"]> {
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyZodFunction = ZodFunction<any, any>;
