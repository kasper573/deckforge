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
  T extends AnyModuleOutputType = AnyModuleOutputType,
  Name extends string = string
> {
  name: Name;
  type: T;
  globals?: object;
  code: string;
}

export type ModuleRuntime<T> = {
  readonly compiled: T;
  dispose(): void;
};

export type RuntimeCompileResult = Result<ModuleRuntime<ModuleOutput>, unknown>;

export interface ModuleCompiler {
  addModule<Definition extends ModuleDefinition>(
    definition: Definition
  ): CompiledModule<Definition["type"]>;

  refs: typeof ModuleReferences.create;

  compile(): RuntimeCompileResult;
}

export type ModuleDefinitions = Record<string, ModuleDefinition>;
export type ModuleCompilerOptions = Pick<CompilerOptions, "lib">;

export interface ModuleRuntimeOptions {
  compilerOptions?: ModuleCompilerOptions;
}

export class ModuleReferences implements Record<string, ModuleReference> {
  [x: string]: ModuleReference;

  constructor(definition: Readonly<Record<string, ModuleReference | string>>) {
    for (const [key, value] of Object.entries(definition)) {
      this[key] =
        value instanceof ModuleReference ? value : new ModuleReference(value);
    }
  }

  static create(names: string[] | Record<string, string>) {
    return new ModuleReferences(
      Array.isArray(names)
        ? Object.fromEntries(names.map((name) => [name, name]))
        : names
    );
  }
}

export const moduleReferenceSymbol = Symbol("moduleReference");

export class ModuleReference implements ModuleReferenceMeta {
  [moduleReferenceSymbol] = "";

  constructor(moduleName: string) {
    this[moduleReferenceSymbol] = moduleName;
  }

  toString() {
    return this[moduleReferenceSymbol];
  }
}

export function addModuleReference<T extends object>(
  target: T,
  moduleName: string
) {
  Object.assign(target, {
    [moduleReferenceSymbol]: moduleName,
  });
}

export const hasModuleReference = (
  value: unknown
): value is ModuleReferenceMeta => {
  return (
    value !== null &&
    typeof value === "object" &&
    moduleReferenceSymbol in value &&
    typeof value[moduleReferenceSymbol] === "string"
  );
};

type ModuleReferenceMeta = {
  [moduleReferenceSymbol]: string;
};
