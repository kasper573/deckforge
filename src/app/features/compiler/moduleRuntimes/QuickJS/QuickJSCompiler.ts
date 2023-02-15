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

  return {
    addModule(definition) {
      modules.get(definition.name)?.dispose();
      const m = new QuickJSModule(runtime.newContext(), definition);
      modules.set(definition.name, m);
      return m.compiled;
    },

    compile(): ModuleCompilerResult {
      const errors: unknown[] = [];
      const compiled: CompiledModules = {};

      for (const m of modules.values()) {
        if (m.error) {
          errors.push(m.error);
        } else {
          compiled[m.definition.name] = m.compiled;
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
