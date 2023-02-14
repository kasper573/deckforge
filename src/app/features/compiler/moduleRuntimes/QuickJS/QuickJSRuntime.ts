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
  private readonly code: string;
  readonly compiled: Output;
  readonly definitionHandle?: QuickJSHandle;

  readonly error?: unknown;

  constructor(
    createVM: () => QuickJSContext,
    type: ZodType<Output>,
    code: string,
    globals?: object
  ) {
    this.code = defineCode(code);
    this.vm = createVM();
    this.marshal = createMarshal(this.vm, this.getHandleAtPath.bind(this));
    this.globalsHandle = globals
      ? this.marshal.assign(this.vm.global, globals)
      : undefined;

    const result = this.vm.evalCode(this.code);

    if (result.error) {
      this.error = coerceError(
        result.error.consume(this.vm.dump),
        `Failed to compile module`
      );
    } else {
      this.definitionHandle = result.value;
      if (!this.definitionHandle) {
        this.error = new Error("Module did define a value");
      }
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

  private getHandleAtPath(path: string[]): QuickJSHandle {
    if (!this.definitionHandle) {
      throw new Error(
        `Could not resolve path "${path.join(".")}" (Module not compiled)\n${
          this.code
        }`
      );
    }
    return path.reduce((target, key) => {
      const handle = this.vm.getProp(target, key);
      if (target !== this.definitionHandle) {
        target.dispose();
      }
      return handle;
    }, this.definitionHandle);
  }

  private callUnmanaged(path: string[], argumentHandles: QuickJSHandle[]) {
    return this.getHandleAtPath(path).consume((handle) => {
      if (this.vm.typeof(handle) !== "function") {
        return;
      }
      return this.vm.callFunction(handle, this.vm.null, ...argumentHandles);
    });
  }

  call(path: string[], args: unknown[]): unknown {
    const argHandles = args.map(this.marshal.create);
    const result = this.callUnmanaged(path, argHandles);
    argHandles.forEach((a) => a.dispose());

    if (result?.error) {
      throw coerceError(
        result.error.consume(this.vm.dump),
        `Failed to invoke "${path.join(".")}"\n${this.code}`
      );
    }

    return result?.value.consume(this.vm.dump);
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
