import { err, ok } from "neverthrow";
import type { QuickJSRuntime } from "quickjs-emscripten";
import type {
  ModuleCompiler,
  CompiledModules,
  ModuleCompilerResult,
} from "../types";
import { QuickJSModule } from "./QuickJSModule";

export function createQuickJSCompiler(
  createRuntime: () => QuickJSRuntime
): ModuleCompiler {
  const runtime = createRuntime();
  const modules = new Map<string, QuickJSModule>();

  function resolveModule(name: string) {
    const m = modules.get(name);
    if (!m) {
      throw new Error(`Module "${name}" not found`);
    }
    return m;
  }

  return {
    addModule(definition) {
      modules.get(definition.name)?.dispose();
      const m = new QuickJSModule(
        runtime.newContext(),
        definition,
        resolveModule
      );
      modules.set(definition.name, m);
      return m.proxy;
    },

    compile(): ModuleCompilerResult {
      const errors: unknown[] = [];
      const compiled: CompiledModules = {};

      for (const m of modules.values()) {
        if (m.error) {
          errors.push(m.error);
        } else {
          compiled[m.definition.name] = m.proxy;
        }
      }

      if (errors.length) {
        return err(new Error(errors.join("\n")));
      }

      return ok(compiled);
    },

    dispose() {
      for (const m of modules.values()) {
        m.dispose();
      }
      modules.clear();
      runtime.dispose();
    },
  };
}
