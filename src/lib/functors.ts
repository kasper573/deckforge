export function createFunctor<
  Name extends string,
  Args extends unknown[],
  Result
>(name: Name, implementation: (name: Name, ...args: Args) => Result) {
  function fn(...args: Args) {
    return implementation(name, ...args);
  }

  Object.defineProperty(fn, "name", { value: name, writable: false });

  return fn;
}

export interface Functor<Name, Args extends unknown[], Result> {
  (name: Name, ...args: Args): Result;
}
