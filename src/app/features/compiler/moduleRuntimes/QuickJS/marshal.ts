import type { QuickJSContext, QuickJSHandle } from "quickjs-emscripten";

export type MarshalAdapter = {
  transform: (value: unknown) => unknown;
  resolve: (value: unknown) => QuickJSHandle | undefined;
};

const noopAdapter: MarshalAdapter = {
  transform: (value) => value,
  resolve: () => undefined,
};

export type Marshal = ReturnType<typeof createMarshal>;

export function createMarshal(
  vm: QuickJSContext,
  adapter: MarshalAdapter = noopAdapter
) {
  function create(input: unknown): RecursiveQuickJSHandle {
    const value = adapter.transform(input);
    const handle = adapter.resolve(value);
    if (handle) {
      return { handle, isReference: true };
    }

    if (Array.isArray(value)) {
      return assign(vm.newArray(), value);
    }
    if (value === null) {
      return { handle: vm.null };
    }
    if (value === undefined) {
      return { handle: vm.undefined };
    }
    switch (typeof value) {
      case "string":
        return { handle: vm.newString(value) };
      case "number":
        return { handle: vm.newNumber(value) };
      case "boolean":
        return { handle: value ? vm.true : vm.false };
      case "object":
        return assign(vm.newObject(), value);
      case "function":
        return {
          handle: vm.newFunction(value.name, (...argumentHandles) => {
            const args = argumentHandles.map(vm.dump);
            const result = value(...args);
            return create(result).handle;
          }),
        };
    }

    throw new Error("Unsupported value type: " + value);
  }

  function assign<Target extends QuickJSHandle>(
    target: Target,
    input: object
  ): RecursiveQuickJSHandle {
    const value = adapter.transform(input);
    const handle = adapter.resolve(value);
    if (handle) {
      return { handle, isReference: true };
    }

    if (typeof value !== "object" || value === null) {
      throw new Error("Expected object");
    }

    const children: RecursiveQuickJSHandle[] = [];
    for (const [k, v] of Object.entries(value)) {
      const node = create(v);
      vm.setProp(target, k, node.handle);
      children.push(node);
    }
    return { handle: target, children };
  }

  function dispose(node: RecursiveQuickJSHandle) {
    if (node.isReference) {
      return; // Don't dispose references
    }
    node.children?.forEach(dispose);
    node.handle.dispose();
  }

  return {
    create,
    assign,
    dispose,
  };
}

export type RecursiveQuickJSHandle = {
  handle: QuickJSHandle;
  children?: RecursiveQuickJSHandle[];
  isReference?: boolean;
};
