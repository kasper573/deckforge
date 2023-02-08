declare module "js-interpreter" {
  export interface InitFunction {
    (interpreter: JSInterpreter, globals: JSGlobals): void;
  }

  export type JSGlobals = Record<string, unknown>;
  export type ValueReference = unknown;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export type AnyFunction = (...args: any) => any;
  export type Primitive = string | number | boolean | null | undefined;

  class JSInterpreter {
    constructor(code: string, init?: InitFunction);
    run(): boolean;
    step(): boolean;
    createNativeFunction(fn: AnyFunction): ValueReference;
    createPrimitive(value: Primitive): ValueReference;
    setProperty(target: unknown, name: string, value: unknown): void;
    appendCode(code: string): void;
    readonly value: unknown;
  }

  export = JSInterpreter;
}
