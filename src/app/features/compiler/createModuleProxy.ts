import type { z } from "zod";
import { ZodFunction, ZodObject } from "zod";
import { zodInstanceOf } from "../../../lib/zod-extensions/zodInstanceOf";
import type {
  CompiledModule,
  ModuleDefinition,
  ModuleOutputRecord,
} from "./moduleRuntimeTypes";

export function createModuleProxy<Definition extends ModuleDefinition>(
  moduleName: string,
  { type }: Definition,
  handleProxyCall: (
    moduleName: string,
    functionName: string | undefined,
    args: unknown[]
  ) => unknown
): CompiledModule<Definition["type"]> {
  function createFunctionProxy<T extends AnyZodFunction>(
    moduleName: string,
    functionName: string | undefined
  ) {
    type Fn = z.infer<T>;

    function moduleFunctionProxy(...args: Parameters<Fn>): ReturnType<Fn> {
      return handleProxyCall(moduleName, functionName, args) as ReturnType<Fn>;
    }

    return moduleFunctionProxy;
  }

  if (zodInstanceOf(type, ZodObject)) {
    const proxies = Object.keys(type.shape).reduce(
      (acc: ModuleOutputRecord, key) => ({
        ...acc,
        [key]: createFunctionProxy(moduleName, key),
      }),
      {}
    );
    return proxies;
  }

  if (zodInstanceOf(type, ZodFunction)) {
    return createFunctionProxy(moduleName, undefined);
  }

  throw new Error("Unsupported module type");
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyZodFunction = ZodFunction<any, any>;
