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

export class ModuleReference {
  constructor(
    public readonly name: string,
    public readonly outputType: ZodType
  ) {}

  static assign(target: object, value: ModuleReference) {
    Object.defineProperty(target, ModuleReference.symbol, { value });
  }

  static symbol = Symbol("ModuleReference");

  static identify(target: unknown): ModuleReference | undefined {
    if (target instanceof ModuleReference) {
      return target;
    }
    const refOnTarget = (target as Record<PropertyKey, unknown> | undefined)?.[
      ModuleReference.symbol
    ];
    if (refOnTarget instanceof ModuleReference) {
      return refOnTarget;
    }
  }
}
