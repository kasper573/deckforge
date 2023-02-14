import type { QuickJSContext, QuickJSHandle } from "quickjs-emscripten";
import { hasModuleReference, moduleReferenceSymbol } from "../types";

export type Marshal = ReturnType<typeof createMarshal>;

export function createMarshal(
  vm: QuickJSContext,
  deferPath: (path: string[]) => QuickJSHandle
) {
  function create(value: unknown): QuickJSHandle {
    if (hasModuleReference(value)) {
      return deferPath(value[moduleReferenceSymbol]);
    }
    if (Array.isArray(value)) {
      return assign(vm.newArray(), value);
    }
    if (value === null) {
      return vm.null;
    }
    if (value === undefined) {
      return vm.undefined;
    }
    switch (typeof value) {
      case "string":
        return vm.newString(value);
      case "number":
        return vm.newNumber(value);
      case "boolean":
        return value ? vm.true : vm.false;
      case "object":
        return assign(vm.newObject(), value);
      case "function":
        return vm.newFunction(value.name, (...argumentHandles) => {
          const args = argumentHandles.map(vm.dump);
          const result = value(...args);
          return create(result);
        });
    }

    throw new Error("Unsupported value type: " + value);
  }

  function assign(
    target: QuickJSHandle,
    value: object,
    _path: string[] = []
  ): QuickJSHandle {
    for (const [k, v] of Object.entries(value)) {
      create(v).consume((h) => vm.setProp(target, k, h));
    }
    return target;
  }

  return {
    create,
    assign,
  };
}
