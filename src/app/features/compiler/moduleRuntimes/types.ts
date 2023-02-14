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
  name: string;
  type: T;
  globals?: object;
  code: string;
}

export type ModuleRuntimeCompileResult = Result<CompiledModules, unknown>;

export interface ModuleRuntime {
  addModule<Definition extends ModuleDefinition>(
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
