import type { AnyFunction } from "js-interpreter";
import type { z, ZodType } from "zod";
import type { CompilerOptions } from "typescript";
import type { Result } from "neverthrow";

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

export type ModuleRuntimeCompileResult = Result<
  CompiledModules,
  ModuleCompileError
>;

export interface ModuleRuntime {
  addModule<Name extends string, Definition extends ModuleDefinition>(
    name: Name,
    definition: Definition
  ): CompiledModule<Definition["type"]>;

  refs: typeof ModuleReferences.create;

  compile(): ModuleRuntimeCompileResult;

  dispose(): void;
}

export type ModuleDefinitions = Record<string, ModuleDefinition>;
export type ModuleCompilerOptions = Pick<CompilerOptions, "lib">;

export interface ModuleRuntimeOptions {
  compilerOptions?: ModuleCompilerOptions;
}

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

export class ModuleCompileError extends Error {
  constructor(
    public readonly moduleErrors: Readonly<Record<string, unknown[]>>
  ) {
    super(
      oneErrorMessageOr(moduleErrors, "Multiple module compilation errors")
    );
    Object.setPrototypeOf(this, ModuleCompileError.prototype);
  }

  toString() {
    return Object.entries(this.moduleErrors)
      .map(([name, errors]) => {
        return `Module "${name}":\n${errors.map(String).join("\n")}`;
      })
      .join("\n");
  }
}

function oneErrorMessageOr(
  moduleErrors: Readonly<Record<string, unknown[]>>,
  fallback: string
): string {
  const errors = Object.values(moduleErrors).flat();
  return errors.length === 1 ? String(errors[0]) : fallback;
}
