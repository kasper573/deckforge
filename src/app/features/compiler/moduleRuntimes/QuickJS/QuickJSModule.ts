import type { QuickJSContext, QuickJSHandle } from "quickjs-emscripten";
import { Scope } from "quickjs-emscripten";
import { ModuleKind, ScriptTarget, transpileModule } from "typescript";
import { symbols as abstractSymbols } from "../symbols";
import type { ModuleDefinition, AnyModuleType } from "../types";
import { createMutateFn } from "../createMutateFn";
import type { Marshal } from "./marshal";
import { createMarshal } from "./marshal";
import { coerceError } from "./coerceError";

export class QuickJSModule<Type extends AnyModuleType = AnyModuleType> {
  readonly marshal: Marshal;
  readonly error?: unknown;

  constructor(
    private readonly vm: QuickJSContext,
    public readonly definition: Readonly<ModuleDefinition<Type>>,
    resolveModule: (name: string) => QuickJSModule
  ) {
    this.marshal = createMarshal(vm, resolveModule);

    try {
      assertNotCircular(definition.globals);
    } catch (error) {
      this.error = (error as Error).message;
      return;
    }

    if (this.definition.globals) {
      this.marshal.assign(vm.global, this.definition.globals);
    }

    let transpiledCode: string | undefined;
    try {
      transpiledCode = transpileModule(definition.code, {
        compilerOptions: {
          target: ScriptTarget.ES2020,
          module: ModuleKind.ES2020,
        },
      }).outputText;
    } catch (error) {
      this.error = new Error(
        "Failed to transpile module as typescript:\n" + error
      );
    }

    if (transpiledCode) {
      const evalResult = vm.evalCode(defineCode(transpiledCode));
      if (evalResult.error) {
        this.error = coerceError(
          evalResult.error.consume(this.vm.dump),
          `Failed to compile module "${definition.name}"`
        );
      } else {
        evalResult.value.dispose();
      }
    }
  }

  resolve(path: string[]): QuickJSHandle {
    return [symbols.definition, ...path].reduce((prev, key) => {
      const next = this.vm.getProp(prev, key);
      prev.dispose();
      return next;
    }, this.vm.global);
  }

  invokeManaged(path: string[], args: unknown[]) {
    assertNotCircular(args);
    return Scope.withScope((scope) => {
      const argHandles = args.map((a) => scope.manage(this.marshal.create(a)));
      const result = this.invokeNative(path, argHandles);
      const returns =
        this.vm.typeof(result) === "function"
          ? this.marshal.oneOffFunction(result)
          : result.consume(this.vm.dump);
      const argsAfter = argHandles.map(this.vm.dump);
      mutate(args, argsAfter);
      return returns;
    });
  }

  invokeNative(path: string[], argHandles: QuickJSHandle[]): QuickJSHandle {
    return Scope.withScope((scope) => {
      const { vm } = this;
      const fnHandle = scope.manage(this.resolve(path));
      if (vm.typeof(fnHandle) !== "function") {
        return vm.undefined;
      }

      const callResult = vm.callFunction(fnHandle, vm.null, ...argHandles);

      if (callResult?.error) {
        throw coerceError(
          callResult.error.consume(this.vm.dump),
          `Failed to invoke ${
            path.length ? `"${path.join(".")}" in ` : ""
          } module "${this.definition.name}"`
        );
      }

      return callResult.value;
    });
  }

  dispose() {
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

function assertNotCircular(value: unknown) {
  const seen = new Set();
  function check(value: unknown) {
    if (typeof value !== "object" || value === null) {
      return;
    }
    if (seen.has(value)) {
      throw new Error("Circular references not allowed");
    }
    seen.add(value);
    Object.values(value).forEach(check);
  }
  check(value);
  seen.clear();
}
