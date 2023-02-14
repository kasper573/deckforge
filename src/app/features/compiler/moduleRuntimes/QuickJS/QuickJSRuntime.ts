import type { QuickJSWASMModule } from "quickjs-emscripten";
import { err, ok } from "neverthrow";
import type { CompiledModules, ModuleRuntime } from "../types";
import { ModuleReferences } from "../types";
import type { MarshalAdapter } from "./marshal";
import { QuickJSModule } from "./QuickJSModule";

export function createQuickJSRuntime(quick: QuickJSWASMModule) {
  const runtime = quick.newRuntime({});
  const modules = new Map<string, QuickJSModule>();
  const moduleResolver = createModuleResolver(modules);

  function dispose() {
    modules.forEach((m) => m.dispose());
    modules.clear();
    runtime?.dispose();
  }

  return {
    refs: (...args) => ModuleReferences.create(...args),

    addModule(definition) {
      modules.get(definition.name)?.dispose();
      const module = new QuickJSModule(runtime, definition, moduleResolver);
      modules.set(definition.name, module);
      return module.compiled;
    },

    compile() {
      const compiled: CompiledModules = {};
      for (const m of modules.values()) {
        if (m.error) {
          m.dispose();
          runtime.dispose();
          return err(m.error);
        } else {
          compiled[m.definition.name] = m.compiled;
        }
      }
      return ok(compiled);
    },
    dispose,
  } satisfies ModuleRuntime;
}

function createModuleResolver(
  modules: Map<string, QuickJSModule>
): MarshalAdapter {
  function requireModule(moduleName: string) {
    const { compiled } = modules.get(moduleName) ?? {};
    if (!compiled) {
      throw new Error(`Module "${moduleName}" not found`);
    }
    return compiled;
  }
  return {
    transform(value) {
      if (value instanceof ModuleReferences) {
        return Object.fromEntries(
          Object.entries(value).map(([identifier, moduleName]) => [
            identifier,
            requireModule(moduleName),
          ])
        );
      }
      return value;
    },
    resolve(value: unknown) {
      for (const { compiled, definitionHandle } of modules.values()) {
        if (compiled === value) {
          return definitionHandle;
        }
      }
    },
  };
}
