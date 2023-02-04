declare module "sandboxr" {
  export interface SandboxExecutionResult {
    toNative(): unknown;
  }

  export interface Sandbox {
    execute(env?: SandboxEnvironment): SandboxValue;
  }

  export interface SandboxEnvironment {
    init(): void;
    createVariable(name: string): SandboxVariable;
    objectFactory: SandboxObjectFactory;
  }

  export interface SandboxObjectFactory {
    createObject<T extends object>(): SandboxObject<T>;
    createPrimitive<T extends Primitive>(value: T): SandboxPrimitive<T>;
    createFunction<T extends AnyFunction>(
      fn: SandboxFunction<T>
    ): SandboxFunctionValue<T>;
  }

  export interface SandboxVariable<T> {
    setValue(value: SandboxValue<T>): void;
  }

  export interface SandboxObject<T extends object>
    extends SandboxValueDiscriminator<"object", T> {
    define(propertyName: string, value: SandboxValue): void;
  }

  export interface SandboxPrimitive<T extends Primitive>
    extends SandboxValueDiscriminator<"primitive", T> {
    readonly value: T;
  }

  export interface SandboxFunctionValue<T extends AnyFunction>
    extends SandboxValueDiscriminator<"function", T>,
      SandboxFunction {}

  export type AnySandboxValue = SandboxValue<never>;
  export type SandboxValue<T extends Primitive | AnyFunction | object> =
    | SandboxPrimitive<T>
    | SandboxObject<T>
    | SandboxFunctionValue<T>;

  export type SandboxValueDiscriminator<Type extends string, Native> = {
    type: Type;
    toNative(): Native;
  };

  export interface SandboxFunction<
    Args extends AnySandboxValue[],
    Return extends AnySandboxValue
  > {
    (...args: Args): Return | void;
  }

  export interface CreateSandboxOptions {
    parse?: AnyFunction;
  }

  export type AnyFunction = <Args extends never>(...args: Args) => unknown;
  export type Primitive = unknown;

  export function create(ast: unknown, options?: CreateSandboxOptions): Sandbox;

  export function createEnvironment(): SandboxEnvironment;
}
