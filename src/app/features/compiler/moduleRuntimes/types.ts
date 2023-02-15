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

  compile(): ModuleCompilerResult;

  dispose(): void;
}
