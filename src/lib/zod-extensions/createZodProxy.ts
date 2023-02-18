import type { ZodType, z } from "zod";
import { ZodFunction, ZodObject } from "zod";
import { zodTypeAtPath } from "./zodTypeAtPath";
import { zodInstanceOf } from "./zodInstanceOf";
import { safeFunctionParse } from "./safeFunctionParse";

export function createZodProxy<RootType extends ZodType>(
  rootType: RootType,
  resolver: <TypeAtPath extends ZodType>(
    path: string[],
    typeAtPath: TypeAtPath
  ) => z.infer<TypeAtPath>,
  rootName?: string
): z.infer<RootType> {
  function resolveValuePath(path: string[]): unknown {
    const fnType = zodTypeAtPath(rootType, path);
    if (fnType && zodInstanceOf(fnType, ZodFunction)) {
      const fnName = rootName ? [rootName, ...path].join(".") : undefined;
      return safeFunctionParse(fnType, resolver(path, fnType), fnName);
    }
    throw new Error("Could not find function type at path: " + path.join("."));
  }

  if (zodInstanceOf(rootType, ZodObject)) {
    const proxy = {} as z.infer<RootType>;

    for (const [key, typeAtPath] of Object.entries(rootType.shape)) {
      if (zodInstanceOf(typeAtPath, ZodObject)) {
        proxy[key] = createZodProxy(typeAtPath, (relativePath, typeAtPath) =>
          resolver([key, ...relativePath], typeAtPath)
        );
      } else {
        Object.defineProperty(proxy, key, {
          get() {
            return resolveValuePath([key]);
          },
        });
      }
    }
    return proxy;
  }

  if (zodInstanceOf(rootType, ZodFunction)) {
    return resolveValuePath([]);
  }

  throw new Error("Root type must be an object or function");
}
