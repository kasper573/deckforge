import type { z, ZodType } from "zod";
import type { CompilerOptions } from "typescript";
import type { Result } from "neverthrow";

export type AnyModuleType = ZodType<CompiledModule>;
export type inferCompiledModule<T extends AnyModuleType> = z.infer<T>;

export type ModuleDefinitions = Record<string, ModuleDefinition>;
export interface ModuleDefinition<
  Type extends AnyModuleType = AnyModuleType,
  Name extends string = string
> {
  name: Name;
  type: Type;
  globals?: object;
  code: string;
}

export type CompiledObjectModule = Partial<
  Record<string, CompiledFunctionModule>
>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type CompiledFunctionModule = (...args: any[]) => any;
export type CompiledModule = CompiledObjectModule | CompiledFunctionModule;
export type CompiledModules = Record<string, CompiledModule>;
export type ModuleCompilerResult = Result<
  CompiledModules,
  Record<string, Error>
>;

export interface ModuleCompilerInfo {
  name: string;
  tsCompilerOptions: Pick<CompilerOptions, "lib">;
  loadCompilerFactory: () => Promise<() => ModuleCompiler>;
}

export interface ModuleCompiler {
  addModule<Definition extends ModuleDefinition>(
    definition: Definition
  ): inferCompiledModule<Definition["type"]>;

  compile(): ModuleCompilerResult;

  dispose(): void;
}

export class ModuleReference {
  constructor(
    public readonly name: string,
    public readonly outputType: AnyModuleType
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
