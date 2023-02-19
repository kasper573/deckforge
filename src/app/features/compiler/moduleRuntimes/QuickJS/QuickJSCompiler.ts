import { err, ok } from "neverthrow";
import type { QuickJSRuntime } from "quickjs-emscripten";
import type {
  ModuleCompiler,
  CompiledModules,
  ModuleCompilerResult,
  CompiledModule,
} from "../types";
import { createZodProxy } from "../../../../../lib/zod-extensions/createZodProxy";
import { ModuleReference } from "../types";
import { safeFunctionParse } from "../../../../../lib/zod-extensions/safeFunctionParse";
import { QuickJSModule } from "./QuickJSModule";

export function createQuickJSCompiler(
  createRuntime: () => QuickJSRuntime
): ModuleCompiler {
  const runtime = createRuntime();
  const compiled = new Map<
    string,
    { module: QuickJSModule; proxy: CompiledModule }
  >();

  function resolveModule(name: string) {
    const m = compiled.get(name)?.module;
    if (!m) {
      throw new Error(`Module "${name}" not found`);
    }
    return m;
  }

  return {
    addModule(definition) {
      compiled.get(definition.name)?.module.dispose();

      const module = new QuickJSModule(
        runtime.newContext(),
        definition,
        resolveModule
      );

      const proxy = createZodProxy(definition.type, (path, typeAtPath) => {
        const fn = (...args: unknown[]) => module.invokeManaged(path, args);
        return safeFunctionParse(
          typeAtPath,
          fn,
          [definition.name, ...path].join(".")
        );
      });

      ModuleReference.assign(
        proxy,
        new ModuleReference(definition.name, definition.type)
      );

      compiled.set(definition.name, { module, proxy });
      return proxy;
    },

    compile(): ModuleCompilerResult {
      const errors: unknown[] = [];
      const proxies: CompiledModules = {};

      for (const { module, proxy } of compiled.values()) {
        if (module.error) {
          errors.push(module.error);
        } else {
          proxies[module.definition.name] = proxy;
        }
      }

      if (errors.length) {
        return err(new Error(errors.join("\n")));
      }

      return ok(proxies);
    },

    dispose() {
      for (const { module } of compiled.values()) {
        module.dispose();
      }
      compiled.clear();
      runtime.dispose();
    },
  };
}
