import type {
  QuickJSContext,
  QuickJSHandle,
  QuickJSRuntime,
} from "quickjs-emscripten";
import { ZodFunction } from "zod";
import { symbols as abstractSymbols } from "../symbols";
import type { CompiledModule, ModuleDefinition } from "../types";
import { createZodProxy } from "../../../../../lib/zod-extensions/createZodProxy";
import { zodInstanceOf } from "../../../../../lib/zod-extensions/zodInstanceOf";
import type {
  Marshal,
  MarshalAdapter,
  RecursiveQuickJSHandle,
} from "./marshal";
import { createMarshal } from "./marshal";
import { coerceError } from "./errorType";

export class QuickJSModule<
  Definition extends ModuleDefinition = ModuleDefinition
> {
  private readonly globalsHandle?: RecursiveQuickJSHandle;
  private readonly vm: QuickJSContext;
  private readonly marshal: Marshal;
  readonly compiled: CompiledModule<Definition["type"]>;
  readonly definitionHandle?: QuickJSHandle;
  readonly error?: unknown;

  constructor(
    private runtime: QuickJSRuntime,
    public readonly definition: Readonly<Definition>,
    marshalAdapter?: MarshalAdapter
  ) {
    this.vm = runtime.newContext({});
    this.marshal = createMarshal(this.vm, marshalAdapter);
    this.globalsHandle = definition.globals
      ? this.marshal.assign(this.vm.global, definition.globals)
      : undefined;

    const result = this.vm.evalCode(defineCode(definition.code));

    if (result.error) {
      this.error = coerceError(
        result.error.consume(this.vm.dump),
        `Failed to compile module "${definition.name}"`
      );
    } else {
      this.definitionHandle = result.value;
    }

    this.compiled = QuickJSModule.createProxy(definition, () => this);
  }

  static createProxy<Definition extends ModuleDefinition>(
    def: Definition,
    getTarget: () => QuickJSModule<Definition>
  ) {
    return createZodProxy(def.type, (path, typeAtPath) => {
      if (!zodInstanceOf(typeAtPath, ZodFunction)) {
        throw new Error("Not a function at path: " + path.join("."));
      }
      return (...args: unknown[]) => getTarget().call(path, args);
    });
  }

  callUnmanaged(path: string[], argumentHandles: QuickJSHandle[]) {
    return this.vm.callFunction(
      this.getHandleAtPath(path),
      this.vm.null,
      ...argumentHandles
    );
  }

  call(path: string[], args: unknown[]) {
    const argNodes = args.map((arg) => this.marshal.create(arg));
    const argHandles = argNodes.map((n) => n.handle);
    const result = this.callUnmanaged(path, argHandles);

    argNodes.forEach(this.marshal.dispose);

    if (result.error) {
      throw coerceError(
        result.error.consume(this.vm.dump),
        "Failed to invoke " + [this.definition.name, ...path].join(".")
      );
    }

    return result.value.consume(this.vm.dump);
  }

  getHandleAtPath(path: string[]): QuickJSHandle {
    if (!this.definitionHandle) {
      throw new Error("Module not compiled");
    }
    return path.reduce(
      (acc, key) => this.vm.getProp(acc, key),
      this.definitionHandle
    );
  }

  dispose() {
    this.definitionHandle?.dispose();
    if (this.globalsHandle) {
      this.marshal.dispose(this.globalsHandle);
    }
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
