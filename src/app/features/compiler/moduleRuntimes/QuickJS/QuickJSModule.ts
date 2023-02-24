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
      assertNotCircular(definition.globals, ["globals"]);
    } catch (error) {
      this.error = error;
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
        this.error =
          `Failed to compile module: ` +
          coerceError(evalResult.error.consume(this.vm.dump));
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
    assertNotCircular(
      args,
      ["args"],
      (msg) => `${invocationError(path, this.definition)}: ${msg}`
    );

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
        throw (
          `${invocationError(path, this.definition)}: ` +
          coerceError(callResult.error.consume(this.vm.dump))
        );
      }

      return callResult.value;
    });
  }

  dispose() {
    this.vm.dispose();
  }
}

const invocationError = (path: string[], def: ModuleDefinition) =>
  `Failed to invoke ${path.length ? `"${path.join(".")}" in ` : ""} module "${
    def.name
  }"`;

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

function assertNotCircular(
  value: unknown,
  startPath: string[],
  formatError = (msg: string) => msg
) {
  const seen = new Set();
  function check(value: unknown, path: string[]) {
    if (typeof value !== "object" || value === null) {
      return;
    }
    if (seen.has(value)) {
      throw new Error(
        formatError(`Circular reference found in ${path.join(".")}`)
      );
    }
    seen.add(value);
    Object.entries(value).forEach(([key, value]) =>
      check(value, [...path, key])
    );
    seen.delete(value);
  }
  check(value, startPath);
  seen.clear();
}
