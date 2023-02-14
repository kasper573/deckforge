import type { QuickJSContext, QuickJSHandle } from "quickjs-emscripten";
import type { ZodType } from "zod";
import { z } from "zod";
import { Scope } from "quickjs-emscripten";
import { symbols as abstractSymbols } from "../symbols";
import type { ModuleRuntime } from "../types";
import { createZodProxy } from "../../../../../lib/zod-extensions/createZodProxy";
import { createMutateFn } from "../createMutateFn";
import type { Marshal } from "./marshal";
import { createMarshal } from "./marshal";
import { coerceError } from "./errorType";

export class QuickJSModuleRuntime<Output> implements ModuleRuntime<Output> {
  private readonly globalsHandle?: QuickJSHandle;
  private readonly vm: QuickJSContext;
  private readonly marshal: Marshal;
  private readonly code: string;
  readonly compiled: Output;
  readonly definitionHandle?: QuickJSHandle;

  readonly error?: unknown;

  constructor(
    createVM: () => QuickJSContext,
    type: ZodType<Output>,
    code: string,
    globals?: object
  ) {
    this.code = defineCode(code);
    this.vm = createVM();
    this.marshal = createMarshal(this.vm, this.getHandleAtPath.bind(this));
    this.globalsHandle = globals
      ? this.marshal.assign(this.vm.global, globals)
      : undefined;

    const result = this.vm.evalCode(this.code);

    if (result.error) {
      this.error = coerceError(
        result.error.consume(this.vm.dump),
        `Failed to compile modules`
      );
    } else {
      this.definitionHandle = result.value;
    }

    this.compiled = QuickJSModuleRuntime.createProxy(type, () => this);
  }

  static createProxy<T extends ZodType>(
    type: T,
    getRuntime: () => QuickJSModuleRuntime<z.infer<T>>
  ) {
    return createZodProxy(
      type,
      (path) =>
        (...args: unknown[]) =>
          getRuntime().call(path, args)
    );
  }

  private getHandleAtPath(path: string[]): QuickJSHandle {
    if (!this.definitionHandle) {
      throw new Error(`Cannot get path handles before compiling has finished`);
    }
    return path.reduce((target, key) => {
      const handle = this.vm.getProp(target, key);
      if (target !== this.definitionHandle) {
        target.dispose();
      }
      return handle;
    }, this.definitionHandle);
  }

  call(path: string[], args: unknown[]) {
    return Scope.withScope((scope) => {
      const { vm, marshal } = this;
      const callResult = vm.callFunction(
        scope.manage(vm.getProp(vm.global, symbols.invoke)),
        vm.null,
        scope.manage(marshal.create(path)),
        scope.manage(marshal.create(args))
      );

      if (callResult?.error) {
        throw coerceError(
          callResult.error.consume(this.vm.dump),
          `Failed to invoke "${path.join(".")}"\n\n${this.code}`
        );
      }

      const rawResponse = callResult.value.consume(this.vm.dump);
      const jsonResult = safeJsonParse(rawResponse);
      if (!jsonResult.success) {
        throw new Error(`Invalid JSON in invocation response: ${rawResponse}`);
      }

      const parseResult = invocationResponseType.safeParse(jsonResult.data);
      if (!parseResult.success) {
        throw new Error(
          `Invalid data structure in invocation response: ${rawResponse}`
        );
      }

      mutate(args, parseResult.data.args);
      return parseResult.data.returns;
    });
  }

  dispose() {
    this.definitionHandle?.dispose();
    this.globalsHandle?.dispose();
    this.vm.dispose();
  }
}

function defineCode(definitionCode: string) {
  const defVar = "___definition___";
  return `
    let ${defVar} = undefined;
    function ${abstractSymbols.define} (def) {
      ${defVar} = def;
    }
    function ${symbols.invoke} (path, args) {
      const fn = path.reduce((acc, key) => acc?.[key], ${defVar});
      const returns = fn?.(...args);
      return JSON.stringify({ returns, args });
    }
    (() => { ${definitionCode} } )();
    ${defVar}
  `;
}

const mutate = createMutateFn();

const symbols = {
  invoke: "___invoke___",
};

const invocationResponseType = z.object({
  returns: z.unknown(),
  args: z.array(z.unknown()),
});

function safeJsonParse(input: string) {
  try {
    return { success: true, data: JSON.parse(input) as unknown };
  } catch (error) {
    return { success: false, error };
  }
}
