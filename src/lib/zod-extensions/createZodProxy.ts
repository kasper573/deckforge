import type { ZodType, z } from "zod";
import { ZodFunction, ZodObject } from "zod";
import { zodTypeAtPath } from "./zodTypeAtPath";
import { zodInstanceOf } from "./zodInstanceOf";

export function createZodProxy<RootType extends ZodType>(
  rootType: RootType,
  resolver: <TypeAtPath extends ZodType>(
    path: string[],
    typeAtPath: TypeAtPath
  ) => z.infer<TypeAtPath>
): z.infer<RootType> {
  function resolveValuePath(path: string[]): unknown {
    const fnType = zodTypeAtPath(rootType, path);
    if (!fnType) {
      throw new Error("Could not find type at path: " + path.join("."));
    }
    return resolver(path, fnType);
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
