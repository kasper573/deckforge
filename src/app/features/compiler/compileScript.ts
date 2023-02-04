import type { z, ZodType } from "zod";
import * as acorn from "acorn";
import type { SandboxFunctionValue, SandboxValue } from "sandboxr";
import * as SandBoxr from "sandboxr";
import type { ErrorDecorator } from "../../../lib/wrapWithErrorDecorator";
import { wrapWithErrorDecorator } from "../../../lib/wrapWithErrorDecorator";
import { LogSpreadError } from "../editor/components/LogList";
import type { RuntimeGenerics, RuntimeScriptAPI } from "./types";

export type CompileScriptResult<T extends ZodType> =
  | { type: "success"; value: z.infer<T> }
  | { type: "error"; error: unknown };

export interface CompileScriptOptions<
  T extends ZodType,
  G extends RuntimeGenerics
> {
  type: T;
  scriptAPI: RuntimeScriptAPI<G>;
  initialValue?: z.infer<T>;
}

export function compileScriptDescribed<
  T extends ZodType,
  G extends RuntimeGenerics
>(kind: string, name: string, ...args: Parameters<typeof compileScript<T, G>>) {
  const result = compileScript(...args);
  const decorateError: ErrorDecorator = (error, path) =>
    error instanceof LogSpreadError
      ? error // Keep the innermost error as-is
      : new LogSpreadError(kind, "(", name, ")", ...path, error);
  if (result.type === "error") {
    throw decorateError(result.error, []);
  }

  return wrapWithErrorDecorator(result.value, decorateError);
}

export function compileScript<T extends ZodType, G extends RuntimeGenerics>(
  code: string,
  options: CompileScriptOptions<T, G>
): CompileScriptResult<T> {
  let ast;
  try {
    ast = acorn.parse(code, { ecmaVersion: 6 });
  } catch (error) {
    return { type: "error", error: `Script parsing error: ${error}` };
  }

  const sandbox = SandBoxr.create(ast, { parse: acorn.parse });
  const definitionHolder = { value: options.initialValue };
  const env = createEnvironmentForScript(options, definitionHolder);

  try {
    sandbox.execute(env);
    return { type: "success", value: definitionHolder.value };
  } catch (error) {
    return { type: "error", error: `Script execution error: ${error}` };
  }
}

function createEnvironmentForScript<
  T extends ZodType,
  G extends RuntimeGenerics
>(
  options: Omit<CompileScriptOptions<T, G>, "initialValue">,
  output: { value: z.infer<T> }
) {
  function define(value: SandboxValue<z.infer<T>>) {
    const newDefinition = value.toNative();
    const result = options.type.safeParse(newDefinition);
    if (!result.success) {
      throw new Error(`Invalid script output: ${result.error.message}`);
    }
    // Cannot use parsed data because zod injects destructive behavior on parsed functions.
    // There's no need for using the parsed data anyway, since it's already json.
    // We're just using zod for validation here, not for parsing.
    output.value = newDefinition;
  }

  function derive(
    value: SandboxFunctionValue<(scriptAPI: RuntimeScriptAPI<G>) => unknown>
  ) {
    const createDefinition = value.toNative();
    const definition = createDefinition(options.scriptAPI);
    define(env.objectFactory.createPrimitive(definition));
  }

  const env = SandBoxr.createEnvironment();
  env.init();
  env
    .createVariable("define")
    .setValue(env.objectFactory.createFunction(define));
  env
    .createVariable("derive")
    .setValue(env.objectFactory.createFunction(derive));
  return env;
}
