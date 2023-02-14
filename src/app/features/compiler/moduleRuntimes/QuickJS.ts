import type { QuickJSHandle, QuickJSWASMModule } from "quickjs-emscripten";
import { err, ok } from "neverthrow";
import type { QuickJSContext } from "quickjs-emscripten";
import type { z } from "zod";
import type { ZodType } from "zod";
import { ZodFunction } from "zod";
import type { QuickJSRuntime } from "quickjs-emscripten";
import { zodInstanceOf } from "../../../../lib/zod-extensions/zodInstanceOf";
import { createZodProxy } from "../../../../lib/zod-extensions/createZodProxy";
import type { CompiledModule, CompiledModules, ModuleDefinition, ModuleRuntime } from "./types";
import { ModuleReferences } from "./types";
import { symbols } from "./symbols";

export function createQuickJSModuleRuntime(
  quick: QuickJSWASMModule
) {
  const modules = new Map<string, QuickJSModule>();
  const runtime = quick.newRuntime({});
  return {
    refs: (...args) => ModuleReferences.create(...args),
    addModule(name, definition) {
      const existingModule = modules.get(name);
      if (existingModule) {
        existingModule.dispose();
      }
      const newModule = new QuickJSModule(runtime, definition);
      modules.set(name, newModule);
      return newModule.compiled;
    },
    compile() {
      const errors: unknown[] = []
      const compiled: CompiledModules = {};
      for (const [name, m] of modules.entries()) {
        if (m.error) {
          errors.push(m.error);
        } else {
          compiled[name] = m.compiled;
        }
      }
      return errors.length > 0 ? err(errors) : ok(compiled)
    },
    dispose() {
      modules.forEach((m) => m.dispose());
      modules.clear();
      runtime.dispose();
    },
  } satisfies ModuleRuntime;
}

class QuickJSModule<Definition extends ModuleDefinition = ModuleDefinition> {
  readonly compiled: CompiledModule<Definition["type"]>;
  private readonly globalsHandle?: QuickJSHandle;
  private readonly vm: QuickJSContext;
  readonly error?: unknown;

  constructor(private runtime: QuickJSRuntime, private definition: Definition) {
    this.vm = runtime.newContext({});
    this.globalsHandle = declareGlobals(this.vm, definition.globals);

    const result = this.vm.evalCode(
      `${definition.code}\n${defineFunctionConventionBindings}`
    );

    if (result.error) {
      this.error = this.vm.dump(result.error);
      result.error.dispose();
    } else {
      result.value.dispose();
    }

    this.compiled = createQuickJSModuleInterface(
      this.vm,
      this.definition.type
    );
  }

  dispose() {
    this.globalsHandle?.dispose();
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
function ${symbols.define} (def) {
  module.exports = def;
}    
`;
