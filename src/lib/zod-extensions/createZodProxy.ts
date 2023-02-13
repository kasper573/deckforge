import type { ZodType, z } from "zod";
import { ZodObject } from "zod";
import { zodTypeAtPath } from "./zodTypeAtPath";
import { zodInstanceOf } from "./zodInstanceOf";

export function createZodProxy<RootType extends ZodType>(
  rootType: RootType,
  resolver: <TypeAtPath extends ZodType>(
    path: string[],
    typeAtPath: TypeAtPath
  ) => z.infer<TypeAtPath>
): z.infer<RootType> {
  if (!zodInstanceOf(rootType, ZodObject)) {
    throw new Error("Root type must be an object");
  }

  function resolveValuePath(path: string[]): unknown {
    const typeAtPath = zodTypeAtPath(rootType, path.join("."));
    if (!typeAtPath) {
      throw new Error("Could not find type at path: " + path.join("."));
    }
    return typeAtPath.parse(resolver(path, typeAtPath));
  }

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
