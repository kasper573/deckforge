declare module "js-interpreter" {
  export interface InitFunction {
    (interpreter: JSInterpreter, globals: JSGlobals): void;
  }

  export type JSGlobals = Record<string, unknown>;
  export type NativeFunctionReference = unknown;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export type AnyFunction = (...args: any) => any;

  class JSInterpreter {
    constructor(code: string, init: InitFunction);
    run(): boolean;
    step(): boolean;
    createNativeFunction(fn: AnyFunction): NativeFunctionReference;
    setProperty(target: unknown, name: string, value: unknown): void;
    appendCode(code: string): void;
    readonly value: unknown;
  }

  export = JSInterpreter;
}
