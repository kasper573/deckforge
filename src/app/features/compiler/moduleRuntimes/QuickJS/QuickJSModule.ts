import type { QuickJSContext, QuickJSHandle } from "quickjs-emscripten";
import { Scope } from "quickjs-emscripten";
import { ZodFunction, ZodObject } from "zod";
import { symbols as abstractSymbols } from "../symbols";
import type { ModuleDefinition, ModuleOutput } from "../types";
import { createZodProxy } from "../../../../../lib/zod-extensions/createZodProxy";
import { createMutateFn } from "../createMutateFn";
import { zodTypeAtPath } from "../../../../../lib/zod-extensions/zodTypeAtPath";
import { zodInstanceOf } from "../../../../../lib/zod-extensions/zodInstanceOf";
import type { Marshal } from "./marshal";
import { createMarshal } from "./marshal";
import { coerceError } from "./errorType";

export class QuickJSModule<Output extends ModuleOutput = ModuleOutput> {
  private readonly globalsHandle?: QuickJSHandle;
  private readonly marshal: Marshal;
  readonly compiled: ModuleOutput;
  readonly error?: unknown;

  constructor(
    private readonly vm: QuickJSContext,
    public readonly definition: Readonly<ModuleDefinition<Output>>
  ) {
    this.marshal = createMarshal(vm, this.defer.bind(this));
    this.globalsHandle = this.definition.globals
      ? this.marshal.assign(vm.global, this.definition.globals)
      : undefined;

    const result = vm.evalCode(defineCode(this.definition.code));

    if (result.error) {
      this.error = coerceError(
        result.error.consume(this.vm.dump),
        `Failed to compile modules`
      );
    } else {
      result.value.dispose();
    }

    this.compiled = createZodProxy(
      definition.type,
      (path) =>
        (...args: unknown[]) =>
          this.call(path, args)
    );
  }

  resolve(path: string[]): QuickJSHandle {
    return [symbols.definition, ...path].reduce((prev, key) => {
      const next = this.vm.getProp(prev, key);
      prev.dispose();
      return next;
    }, this.vm.global);
  }

  defer(path: string[]): QuickJSHandle {
    const typeAtPath = zodTypeAtPath(this.definition.type, path);
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
            return this.marshal.create(() => this.resolve([...path, key]));
          },
        });
      }
      return obj;
    }
    return this.resolve(path);
  }

  call(path: string[], args: unknown[]) {
    return Scope.withScope((scope) => {
      const { vm, marshal } = this;
      const dump = this.vm.dump(this.vm.global);
      const fnHandle = scope.manage(this.resolve(path));
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
    this.globalsHandle?.dispose();
    this.vm.dispose();
  }
}

function defineCode(definitionCode: string) {
  return `
    globalThis.${symbols.definition} = undefined;
    function ${abstractSymbols.define} (def) {
      globalThis.${symbols.definition} = def;
    }
    ${definitionCode}
  `;
}

const mutate = createMutateFn();

const symbols = {
  definition: "___definition___",
};
