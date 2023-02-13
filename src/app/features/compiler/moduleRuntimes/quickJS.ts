import type { QuickJSHandle, QuickJSWASMModule } from "quickjs-emscripten";
import { ok } from "neverthrow";
import type { QuickJSContext } from "quickjs-emscripten";
import type { z } from "zod";
import type { ZodType } from "zod";
import { ZodFunction } from "zod";
import type { QuickJSRuntime } from "quickjs-emscripten";
import { zodInstanceOf } from "../../../../lib/zod-extensions/zodInstanceOf";
import { createZodProxy } from "../../../../lib/zod-extensions/createZodProxy";
import type { CompiledModule, ModuleDefinition } from "../moduleRuntimeTypes";
import { ModuleReferences } from "../moduleRuntimeTypes";
import type { JSInterpreterModuleRuntime } from "./JSInterpreter";

export function createQuickJSModuleRuntime(
  quick: QuickJSWASMModule
): Readonly<JSInterpreterModuleRuntime> {
  const modules = new Map<string, QuickJSModule>();
  const runtime = quick.newRuntime({});
  return {
    refs: ModuleReferences.create,
    addModule(name, definition) {
      const existingModule = modules.get(name);
      if (existingModule) {
        existingModule.dispose();
      }
      const newModule = new QuickJSModule(runtime, definition);
      modules.set(name, newModule);
      return newModule.interface;
    },
    compile() {
      return ok(
        Object.fromEntries(
          Array.from(modules.entries()).map(([name, m]) => [name, m.interface])
        )
      );
    },
    dispose() {
      modules.forEach((m) => m.dispose());
      modules.clear();
      runtime.dispose();
    },
  };
}

class QuickJSModule<Definition extends ModuleDefinition = ModuleDefinition> {
  readonly interface: CompiledModule<Definition["type"]>;
  private readonly globalsHandle?: QuickJSHandle;
  private readonly vm: QuickJSContext;

  constructor(private runtime: QuickJSRuntime, private definition: Definition) {
    this.vm = runtime.newContext({});
    this.globalsHandle = declareGlobals(this.vm, definition.globals);

    const definitionEvaluation = this.vm.evalCode(
      `${definition.code}\n${defineFunctionConventionBindings}`
    );

    // Evaluation output not used and can be disposed immediately
    this.vm.unwrapResult(definitionEvaluation).dispose();

    this.interface = createQuickJSModuleInterface(
      this.vm,
      this.definition.type
    );
  }

  dispose() {
    if (this.globalsHandle) {
      this.globalsHandle.dispose();
    }
    this.vm.dispose();
  }
}

function createQuickJSModuleInterface<T extends ZodType>(
  vm: QuickJSContext,
  type: T
): z.infer<T> {
  return createZodProxy(type, (path, typeAtPath) => {
    if (!zodInstanceOf(typeAtPath, ZodFunction)) {
      throw new Error("Unsupported type");
    }
    return (...args: unknown[]) => {
      const result = vm.evalCode(
        `${path.join(".")}(...${JSON.stringify(args)});`
      );
      const handle = vm.unwrapResult(result);
      return getJSValue(vm, handle);
    };
  });
}

function getJSValue(vm: QuickJSContext, handle: QuickJSHandle): unknown {
  handle.dispose();
  return undefined;
}

function declareGlobals(
  vm: QuickJSContext,
  globals?: object
): QuickJSHandle | undefined {
  return undefined;
}

const defineFunctionConventionBindings = `
function define (def) {
  module.exports = def;
}    
`;
