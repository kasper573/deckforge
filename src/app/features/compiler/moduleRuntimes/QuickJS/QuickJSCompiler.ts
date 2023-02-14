import { ok } from "neverthrow";
import type { ZodType } from "zod";
import { z } from "zod";
import type { QuickJSContext } from "quickjs-emscripten";
import type {
  ModuleDefinition,
  ModuleCompiler,
  CompiledModule,
  ModuleOutput,
} from "../types";
import { ModuleReferences } from "../types";
import { symbols } from "../symbols";
import { QuickJSModuleRuntime } from "./QuickJSRuntime";

export function createQuickJSCompiler(
  createVM: () => QuickJSContext
): ModuleCompiler {
  const definitions = new Map<string, ModuleDefinition>();
  let combined = combineDefinitions([]);

  let runtime: QuickJSModuleRuntime<unknown>;
  return {
    refs: (...args) => ModuleReferences.create(...args),

    addModule<Definition extends ModuleDefinition>(
      definition: Definition
    ): CompiledModule<Definition["type"]> {
      definitions.set(definition.name, definition);
      combined = combineDefinitions([...definitions.values()]);
      type Slice = Record<Definition["name"], Definition>;
      const rootProxy = QuickJSModuleRuntime.createProxy(
        combined.type as unknown as ZodType<Slice>,
        () => runtime as QuickJSModuleRuntime<Slice>
      );
      return rootProxy[definition.name as keyof Slice] as never;
    },

    compile() {
      runtime?.dispose();
      runtime = new QuickJSModuleRuntime(
        createVM,
        combined.type,
        combined.code,
        combined.globals
      );
      return ok(runtime as QuickJSModuleRuntime<ModuleOutput>);
    },
  };
}

function combineDefinitions(definitions: ModuleDefinition[]): ModuleDefinition {
  const scopeVariable = "___scope___";
  const scopeKey = (def: ModuleDefinition) => def.name;
  const globalVariable = (def: ModuleDefinition) => `${def.name}_globals`;
  return {
    name: "combined",
    code: `
      const ${scopeVariable} = {};
      ${definitions
        .map((def) =>
          codeWithScopedDefine({
            code: def.code,
            scopeKey: scopeKey(def),
            scopeVariable,
            globalVariable: globalVariable(def),
            globalProperties: Object.keys(def.globals ?? {}),
          })
        )
        .join("\n")}
      ${symbols.define}(${scopeVariable});
    `,
    type: z.object(
      definitions.reduce(
        (acc, def) => ({ ...acc, [scopeKey(def)]: def.type }),
        {}
      )
    ),
    globals: definitions.reduce(
      (acc, def) => ({ ...acc, [globalVariable(def)]: def.globals }),
      {}
    ),
  };
}

function codeWithScopedDefine(o: {
  code: string;
  scopeKey: string;
  scopeVariable: string;
  globalVariable: string;
  globalProperties: string[];
}) {
  return `
    // Module: ${o.scopeKey}
    // Globals: ${o.globalProperties.join(", ") || "(None)"}
    (() => {
      function ${symbols.define} (def) {
        ${o.scopeVariable}["${o.scopeKey}"] = def;
      }
      ${o.globalProperties
        ?.map((g) => `const ${g} = ${o.globalVariable}["${g}"];`)
        .join("\n")}
      ${o.code};
    })();
  `;
}
