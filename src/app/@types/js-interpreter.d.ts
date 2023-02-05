declare module "js-interpreter" {
  export interface InitFunction {
    (interpreter: JSInterpreter, globals: JSGlobals): void;
  }

  export type JSGlobals = Record<string, unknown>;
  export type NativeFunctionReference = unknown;
  export type AnyFunction = <Args extends never>(...args: Args) => unknown;

  class JSInterpreter {
    constructor(code: string, init: InitFunction);
    run(): boolean;
    step(): boolean;
    createNativeFunction(fn: AnyFunction): NativeFunctionReference;
    setProperty(target: unknown, name: string, value: unknown): void;
  }

  export = JSInterpreter;
}
