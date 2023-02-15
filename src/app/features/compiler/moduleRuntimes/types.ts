import type { AnyFunction } from "js-interpreter";
import type { z, ZodType } from "zod";
import type { CompilerOptions } from "typescript";
import type { Result } from "neverthrow";

export type ModuleOutput = ModuleOutputRecord | ModuleOutputFunction;
export type ModuleOutputFunction = AnyFunction;
export type ModuleOutputRecord = Partial<Record<string, ModuleOutputFunction>>;
export type ModuleDefinitions = Record<string, ModuleDefinition>;
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
export type ModuleCompilerResult = Result<CompiledModules, unknown>;

export interface ModuleCompilerInfo {
  name: string;
  tsCompilerOptions: Pick<CompilerOptions, "lib">;
  loadCompilerFactory: () => Promise<() => ModuleCompiler>;
}

export interface ModuleCompiler {
  addModule<Definition extends ModuleDefinition>(
    definition: Definition
  ): z.infer<Definition["type"]>;

  refs: typeof ModuleReferences.create;

  compile(): ModuleCompilerResult;

  dispose(): void;
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

export class ModuleReference {
  constructor(public readonly path: string[]) {}

  toString() {
    return this.path.join(".");
  }

  static create(nameOrPath: string | string[]) {
    return new ModuleReference(
      Array.isArray(nameOrPath) ? nameOrPath : [nameOrPath]
    );
  }
}
