import type { QuickJSHandle, QuickJSWASMModule } from "quickjs-emscripten";
import { err, ok } from "neverthrow";
import type { QuickJSContext } from "quickjs-emscripten";
import { z } from "zod";
import { ZodFunction } from "zod";
import type { QuickJSRuntime } from "quickjs-emscripten";
import { zodInstanceOf } from "../../../../lib/zod-extensions/zodInstanceOf";
import { createZodProxy } from "../../../../lib/zod-extensions/createZodProxy";
import type {
  CompiledModule,
  CompiledModules,
  ModuleDefinition,
  ModuleRuntime,
} from "./types";
import { ModuleReferences } from "./types";
import { symbols as abstractSymbols } from "./symbols";

export function createQuickJSModuleRuntime(quick: QuickJSWASMModule) {
  const modules = new Map<string, QuickJSModule>();
  const runtime = quick.newRuntime({});
  return {
    refs: (...args) => ModuleReferences.create(...args),
    addModule(definition) {
      const existingModule = modules.get(definition.name);
      if (existingModule) {
        existingModule.dispose();
      }
      const newModule = new QuickJSModule(runtime, definition);
      modules.set(definition.name, newModule);
      return newModule.compiled;
    },
    compile() {
      const compiled: CompiledModules = {};
      for (const [name, m] of modules.entries()) {
        if (m.error) {
          return err(m.error);
        } else {
          compiled[name] = m.compiled;
        }
      }
      return ok(compiled);
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
      `${defineFunctionConventionBindings}\n${definition.code}`
    );

    if (result.error) {
      this.error = coerceError(
        result.error.consume(this.vm.dump),
        `Failed to compile module "${definition.name}"`
      );
    } else {
      result.value.dispose();
    }

    this.compiled = createQuickJSModuleInterface(this.vm, this.definition);
  }

  dispose() {
    this.globalsHandle?.dispose();
    this.vm.dispose();
  }
}

function createQuickJSModuleInterface<Def extends ModuleDefinition>(
  vm: QuickJSContext,
  { type, name }: Def
): z.infer<Def["type"]> {
  return createZodProxy(type, (path, typeAtPath) => {
    if (!zodInstanceOf(typeAtPath, ZodFunction)) {
      throw new Error("Unsupported type");
    }
    return (...args: unknown[]) => {
      const result = vm.evalCode(invocationCode(path, args));
      if (result.error) {
        throw coerceError(
          result.error.consume(vm.dump),
          "Failed to invoke " + [name, ...path].join(".")
        );
      }
      return result.value.consume(vm.dump);
    };
  });
}

const invocationCode = (path: string[], args: unknown[]) =>
  `${symbols.select}(${JSON.stringify(path)})(${stringifyArgs(args)});`;

const stringifyArgs = (args: unknown[]) =>
  args.map((a) => JSON.stringify(a)).join(", ");

function declareGlobals(
  vm: QuickJSContext,
  globals?: object
): QuickJSHandle | undefined {
  return undefined;
}

const errorType = z.object({
  message: z.string(),
  name: z.string(),
  stack: z.string(),
});

function coerceError(input: unknown, description: string): Error {
  const result = errorType.safeParse(input);
  if (result.success) {
    const { name, message, stack } = result.data;
    return new Error(`${description}. ${name}: ${message}\n${stack}`);
  }
  return new Error(description + ": " + String(input));
}

const symbols = {
  ...abstractSymbols,
  def: "___definition___",
  select: "___selectFromDefinition___",
};

const defineFunctionConventionBindings = `
let ${symbols.def} = undefined;
function ${abstractSymbols.define} (def) {
  ${symbols.def} = def;
}
function ${symbols.select}(path) {
  return path.reduce((acc, key) => acc[key], ${symbols.def});
}
`;
