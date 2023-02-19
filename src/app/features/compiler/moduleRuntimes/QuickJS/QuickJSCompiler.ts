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

export interface QuickJSCompilerOptions {
  createRuntime: () => QuickJSRuntime;
  memoryLeaks?: "warn" | "error" | "ignore";
}

export function createQuickJSCompiler({
  createRuntime,
  memoryLeaks,
}: QuickJSCompilerOptions): ModuleCompiler {
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
        disposeBlock(memoryLeaks, `module "${module.definition.name}"`, () =>
          module.dispose()
        );
      }
      compiled.clear();
      disposeBlock(memoryLeaks, "runtime", () => runtime.dispose());
    },
  };
}

function disposeBlock(
  leak: QuickJSCompilerOptions["memoryLeaks"] = "error",
  name: string,
  block: () => void
) {
  try {
    block();
  } catch (error) {
    const message = `Memory leak detected in ${name}:\n${error}`;
    switch (leak) {
      case "error":
        throw new Error(message);
      case "warn":
        console.warn(message);
        break;
    }
  }
}
