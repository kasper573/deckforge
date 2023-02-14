import type { QuickJSContext, QuickJSHandle } from "quickjs-emscripten";
import type { ZodType, z } from "zod";
import { ZodFunction } from "zod";
import { symbols as abstractSymbols } from "../symbols";
import type { ModuleRuntime } from "../types";
import { createZodProxy } from "../../../../../lib/zod-extensions/createZodProxy";
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
    type: ZodType<Output>,
    code: string,
    globals?: object
  ) {
    this.vm = createVM();
    this.marshal = createMarshal(this.vm, this.getHandleAtPath.bind(this));
    this.globalsHandle = globals
      ? this.marshal.assign(this.vm.global, globals)
      : undefined;

    const result = this.vm.evalCode(defineCode(code));

    if (result.error) {
      this.error = coerceError(
        result.error.consume(this.vm.dump),
        `Failed to compile module`
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
    return createZodProxy(type, (path, typeAtPath) => {
      if (!zodInstanceOf(typeAtPath, ZodFunction)) {
        throw new Error(`Not a function: "${path.join(".")}"`);
      }
      return (...args: unknown[]) => getRuntime().call(path, args);
    });
  }

  callUnmanaged(path: string[], argumentHandles: QuickJSHandle[]) {
    return this.getHandleAtPath(path).consume((fnHandle) =>
      this.vm.callFunction(fnHandle, this.vm.null, ...argumentHandles)
    );
  }

  call(path: string[], args: unknown[]) {
    const argHandles = args.map(this.marshal.create);
    const result = this.callUnmanaged(path, argHandles);
    argHandles.forEach((a) => a.dispose());

    if (result.error) {
      throw coerceError(
        result.error.consume(this.vm.dump),
        `Failed to invoke "${path.join(".")}"`
      );
    }

    return result.value.consume(this.vm.dump);
  }

  getHandleAtPath(path: string[]): QuickJSHandle {
    if (!this.definitionHandle) {
      throw new Error("Module not compiled");
    }
    return path.reduce((acc, key, index) => {
      const handle = this.vm.getProp(acc, key);
      const isLeaf = index === path.length - 1;
      if (!isLeaf) {
        handle.dispose();
      }
      return handle;
    }, this.definitionHandle);
  }

  dispose() {
    this.definitionHandle?.dispose();
    this.globalsHandle?.dispose();
    this.vm.dispose();
  }
}

function defineCode(code: string) {
  const def = "___definition___";
  return `
    let ${def} = undefined;
    function ${abstractSymbols.define} (def) {
      ${def} = def;
    }
    (() => { ${code} } )();
    ${def}
  `;
}
