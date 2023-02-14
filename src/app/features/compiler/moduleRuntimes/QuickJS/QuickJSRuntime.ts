import type { QuickJSContext, QuickJSHandle } from "quickjs-emscripten";
import type { ZodType } from "zod";
import type { z } from "zod";
import { Scope } from "quickjs-emscripten";
import { ZodFunction, ZodObject } from "zod";
import { symbols as abstractSymbols } from "../symbols";
import type { ModuleRuntime } from "../types";
import { createZodProxy } from "../../../../../lib/zod-extensions/createZodProxy";
import { createMutateFn } from "../createMutateFn";
import { zodTypeAtPath } from "../../../../../lib/zod-extensions/zodTypeAtPath";
import { zodInstanceOf } from "../../../../../lib/zod-extensions/zodInstanceOf";
import type { Marshal } from "./marshal";
import { createMarshal } from "./marshal";
import { coerceError } from "./errorType";

export class QuickJSModuleRuntime<Output> implements ModuleRuntime<Output> {
  private readonly globalsHandle?: QuickJSHandle;
  private readonly vm: QuickJSContext;
  private readonly marshal: Marshal;
  readonly compiled: Output;
  readonly definitionHandle?: QuickJSHandle;
  readonly error?: unknown;

  constructor(
    createVM: () => QuickJSContext,
    private readonly type: ZodType<Output>,
    code: string,
    globals?: object
  ) {
    this.vm = createVM();
    this.marshal = createMarshal(this.vm, this.deferPath.bind(this));
    this.globalsHandle = globals
      ? this.marshal.assign(this.vm.global, globals)
      : undefined;

    const result = this.vm.evalCode(defineCode(code));

    if (result.error) {
      this.error = coerceError(
        result.error.consume(this.vm.dump),
        `Failed to compile modules`
      );
    } else {
      this.definitionHandle = result.value;
    }

    this.compiled = QuickJSModuleRuntime.createProxy(type, () => this);
  }

  static createProxy<T extends ZodType>(
    type: T,
    getRuntime: () => QuickJSModuleRuntime<z.infer<T>>
  ) {
    return createZodProxy(
      type,
      (path) =>
        (...args: unknown[]) =>
          getRuntime().call(path, args)
    );
  }

  private resolvePath(path: string[]): QuickJSHandle {
    if (!this.definitionHandle) {
      throw new Error(`Cannot get path handles before compiling has finished`);
    }
    return path.reduce((target, key) => {
      const handle = this.vm.getProp(target, key);
      if (target !== this.definitionHandle) {
        target.dispose();
      }
      return handle;
    }, this.definitionHandle);
  }

  private deferPath(path: string[]): QuickJSHandle {
    const typeAtPath = zodTypeAtPath(this.type, path);
    if (!typeAtPath) {
      throw new Error(`Unknown path: ${path.join(".")}`);
    }
    if (zodInstanceOf(typeAtPath, ZodFunction)) {
      return this.marshal.create((...args: unknown[]) => this.call(path, args));
    }
    if (zodInstanceOf(typeAtPath, ZodObject)) {
      const obj = this.vm.newObject();
      for (const key of Object.keys(typeAtPath.shape)) {
        this.vm.defineProp(obj, key, {
          get: () => {
            return this.marshal.create(() => this.resolvePath([...path, key]));
          },
        });
      }
      return obj;
    }
    return this.resolvePath(path);
  }

  call(path: string[], args: unknown[]) {
    return Scope.withScope((scope) => {
      const { vm, marshal } = this;
      const fnHandle = scope.manage(this.resolvePath(path));
      if (vm.typeof(fnHandle) !== "function") {
        return;
      }

      const argHandles = args.map((a) => scope.manage(marshal.create(a)));
      const callResult = vm.callFunction(fnHandle, vm.null, ...argHandles);

      if (callResult?.error) {
        throw coerceError(
          callResult.error.consume(this.vm.dump),
          `Failed to invoke "${path.join(".")}"`
        );
      }

      const returns = callResult.value.consume(this.vm.dump);
      const argsAfter = argHandles.map(this.vm.dump);
      mutate(args, argsAfter);
      return returns;
    });
  }

  dispose() {
    this.definitionHandle?.dispose();
    this.globalsHandle?.dispose();
    this.vm.dispose();
  }
}

function defineCode(definitionCode: string) {
  const defVar = "___definition___";
  return `
    let ${defVar} = undefined;
    function ${abstractSymbols.define} (def) {
      ${defVar} = def;
    }
    (() => { ${definitionCode} } )();
    ${defVar}
  `;
}

const mutate = createMutateFn();
