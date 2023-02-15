import type { QuickJSContext, QuickJSHandle } from "quickjs-emscripten";
import { Scope } from "quickjs-emscripten";
import { z } from "zod";
import { ModuleKind, ScriptTarget, transpileModule } from "typescript";
import { symbols as abstractSymbols } from "../symbols";
import type { ModuleDefinition, ModuleOutput } from "../types";
import { createZodProxy } from "../../../../../lib/zod-extensions/createZodProxy";
import { createMutateFn } from "../createMutateFn";
import type { Marshal } from "./marshal";
import { createMarshal } from "./marshal";

export class QuickJSModule<Output extends ModuleOutput = ModuleOutput> {
  readonly marshal: Marshal;
  readonly compiled: ModuleOutput;
  readonly error?: unknown;

  constructor(
    private readonly vm: QuickJSContext,
    public readonly definition: Readonly<ModuleDefinition<Output>>,
    getModuleReference: (path: string[]) => QuickJSHandle
  ) {
    this.marshal = createMarshal(vm, getModuleReference);

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

  call(path: string[], args: unknown[]) {
    return Scope.withScope((scope) => {
      const { vm, marshal } = this;
      const fnHandle = scope.manage(this.resolve(path));
      if (vm.typeof(fnHandle) !== "function") {
        return;
      }

      const argHandles = args.map((a) => scope.manage(marshal.create(a)));
      const callResult = vm.callFunction(fnHandle, vm.null, ...argHandles);

      if (callResult?.error) {
        throw coerceError(
          callResult.error.consume(this.vm.dump),
          `Failed to invoke "${path.join(".")}" in module "${
            this.definition.name
          }"`
        );
      }

      const returns = callResult.value.consume(this.vm.dump);
      const argsAfter = argHandles.map(this.vm.dump);
      mutate(args, argsAfter);
      return returns;
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

function coerceError(input: unknown, description: string): Error {
  const result = errorType.safeParse(input);
  if (result.success) {
    const { name, message, stack } = result.data;
    return new Error(`${description}. ${name}: ${message}\n${stack}`);
  }
  return new Error(description + ": " + String(input));
}

const errorType = z.object({
  message: z.string(),
  name: z.string(),
  stack: z.string(),
});
