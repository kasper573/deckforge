import type { QuickJSContext, QuickJSHandle } from "quickjs-emscripten";
import { isPlainObject } from "lodash";
import { Scope } from "quickjs-emscripten";
import { ZodFunction, ZodObject } from "zod";
import { ModuleReference } from "../types";
import { zodInstanceOf } from "../../../../../lib/zod-extensions/zodInstanceOf";
import { createMutateFn } from "../createMutateFn";
import type { QuickJSModule } from "./QuickJSModule";
import { coerceError } from "./coerceError";

export type Marshal = ReturnType<typeof createMarshal>;

export function createMarshal(
  vm: QuickJSContext,
  resolveModule: (name: string) => QuickJSModule
) {
  function create(value: unknown, target?: QuickJSHandle): QuickJSHandle {
    const moduleReference = ModuleReference.identify(value);
    if (moduleReference) {
      return deferModule(moduleReference);
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
        const isTargetAnObject =
          target && vm.null !== target && vm.typeof(target) === "object";
        return assign(isTargetAnObject ? target : vm.newObject(), value);
      case "function":
        return vm.newFunction(value.name, (...argHandles) => {
          const args = argHandles.map(vm.dump);
          const result = value(...args);
          mutateArrayElements(argHandles, args);
          return create(result);
        });
    }

    throw new Error("Unsupported value type: " + value);
  }

  function assign(objHandle: QuickJSHandle, obj: object): QuickJSHandle {
    for (const [propName, propValue] of Object.entries(obj)) {
      Scope.withScope((scope) => {
        const existingPropValueHandle = scope.manage(
          vm.getProp(objHandle, propName)
        );
        const newPropValueHandle = scope.manage(
          create(propValue, existingPropValueHandle)
        );
        vm.setProp(objHandle, propName, newPropValueHandle);
      });
    }
    return objHandle;
  }

  function mutateArrayElements(elements: QuickJSHandle[], values: unknown[]) {
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];
      const value = values[i];
      if (isPlainObject(value)) {
        assign(element, value as object);
      }
    }
  }

  function deferModule({ name, outputType }: ModuleReference) {
    if (zodInstanceOf(outputType, ZodObject)) {
      const deferredModuleShape = vm.newObject();
      for (const key of Object.keys(outputType.shape)) {
        vm.defineProp(deferredModuleShape, key, {
          get: () => resolveModule(name).resolve([key]),
        });
      }
      return deferredModuleShape;
    }
    if (zodInstanceOf(outputType, ZodFunction)) {
      return vm.newFunction(
        `defer_module_${name}_as_function`,
        (...argHandles) => resolveModule(name).invokeNative([], argHandles)
      );
    }
    throw new Error("Unsupported deferred module type");
  }

  function oneOffFunction(fnHandle: QuickJSHandle) {
    return (...args: unknown[]): unknown => {
      const argHandles = args.map((a) => create(a));
      const callResult = vm.callFunction(fnHandle, vm.null, ...argHandles);
      if (callResult?.error) {
        throw (
          `Failed to invoke one-off function: ` +
          coerceError(callResult.error.consume(vm.dump))
        );
      }
      const result = callResult.value.consume(vm.dump);
      fnHandle.dispose();
      const argsAfter = argHandles.map((a) => a.consume(vm.dump));
      mutate(args, argsAfter);
      return result;
    };
  }

  return {
    create: (value: unknown) => create(value),
    assign,
    oneOffFunction,
  };
}

const mutate = createMutateFn();
