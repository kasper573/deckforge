export function wrapWithErrorDecorator<T>(
  value: T,
  decorate: ErrorDecorator,
  path: string[] = []
): T {
  if (typeof value === "function") {
    return wrapFunctionWithErrorDecorator(
      value as AnyFunction,
      decorate,
      path
    ) as T;
  }
  if (typeof value === "object" && value !== null) {
    return wrapObjectWithErrorDecorator(value, decorate, path) as T;
  }
  return value;
}

function wrapObjectWithErrorDecorator<T extends object>(
  object: T,
  decorate: ErrorDecorator,
  path: string[]
): T {
  const wrappedObject = {} as T;
  for (const [key, value] of Object.entries(object)) {
    wrappedObject[key as keyof T] = wrapWithErrorDecorator(value, decorate, [
      ...path,
      key,
    ]);
  }
  return wrappedObject;
}

function wrapFunctionWithErrorDecorator<Fn extends AnyFunction>(
  fn: Fn,
  decorate: ErrorDecorator,
  path: string[]
): Fn {
  function errorDecorator(...args: Parameters<Fn>) {
    try {
      return fn(...args);
    } catch (error) {
      throw decorate(error, path);
    }
  }

  return errorDecorator as unknown as Fn;
}

export type ErrorDecorator = (error: unknown, path: string[]) => unknown;
type AnyFunction = (...args: never[]) => unknown;
