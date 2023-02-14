import type { AnyFunction } from "js-interpreter";
import type { z, ZodType } from "zod";
import type { CompilerOptions } from "typescript";
import type { Result } from "neverthrow";

export type ModuleOutput = ModuleOutputRecord | ModuleOutputFunction;
export type ModuleOutputFunction = AnyFunction;
export type ModuleOutputRecord = Partial<Record<string, ModuleOutputFunction>>;

export interface ModuleDefinition<
  Output extends ModuleOutput = ModuleOutput,
  Name extends string = string
> {
  name: Name;
  type: ZodType<Output>;
  globals?: object;
  code: string;
}

export type CompiledModules = Record<string, ModuleOutput>;
export type RuntimeCompileResult = Result<CompiledModules, unknown>;

export interface ModuleCompiler {
  addModule<Definition extends ModuleDefinition>(
    definition: Definition
  ): z.infer<Definition["type"]>;

  refs: typeof ModuleReferences.create;

  compile(): RuntimeCompileResult;

  dispose(): void;
}

export type ModuleDefinitions = Record<string, ModuleDefinition>;
export type ModuleCompilerOptions = Pick<CompilerOptions, "lib">;

export interface ModuleRuntimeOptions {
  compilerOptions?: ModuleCompilerOptions;
}

export class ModuleReferences implements Record<string, ModuleReference> {
  [x: string]: ModuleReference;

  constructor(definition: Readonly<Record<string, ModuleReference>>) {
    for (const [key, value] of Object.entries(definition)) {
      this[key] = value;
    }
  }

  static create(references: string[] | Record<string, string | string[]>) {
    if (Array.isArray(references)) {
      return new ModuleReferences(
        Object.fromEntries(
          references.map((name) => [name, new ModuleReference([name])])
        )
      );
    }
    return new ModuleReferences(
      Object.fromEntries(
        Object.entries(references).map(([key, value]) => [
          key,
          ModuleReference.create(value),
        ])
      )
    );
  }
}

export const moduleReferenceSymbol = Symbol("moduleReference");

export class ModuleReference implements ModuleReferenceMeta {
  [moduleReferenceSymbol]: string[] = [];

  constructor(path: string[]) {
    this[moduleReferenceSymbol] = path;
  }

  toString() {
    return this[moduleReferenceSymbol].join(".");
  }

  static create(nameOrPath: string | string[]) {
    return new ModuleReference(
      Array.isArray(nameOrPath) ? nameOrPath : [nameOrPath]
    );
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
  [moduleReferenceSymbol]: string[];
};
