export function createNamedFunction<
  Name extends string,
  Args extends AnyArgs,
  Result
>(name: Name, implementation: NamedFunctionImplementation<Name, Args, Result>) {
  function namedFunction(...args: Args): Result {
    return implementation(name, ...args);
  }

  Object.defineProperty(namedFunction, "name", {
    value: name,
    writable: false,
  });

  return namedFunction;
}

export function createNamedFunctions() {
  return new NamedFunctionBuilder({});
}

class NamedFunctionBuilder<T extends AnyFunctions> {
  constructor(private readonly functions: T) {}

  add<Name extends string, Args extends AnyArgs, Result>(
    name: Name,
    implementation: NamedFunctionImplementation<Name, Args, Result>
  ): NamedFunctionBuilder<T & Record<Name, (...args: Args) => Result>> {
    return new NamedFunctionBuilder({
      ...this.functions,
      [name]: createNamedFunction(name, implementation),
    });
  }

  build() {
    return this.functions;
  }
}

export type NamedFunctionImplementations<Names extends string = string> = {
  [Name in Names]: NamedFunctionImplementation<Name>;
};

export type NamedFunctionImplementation<
  Name extends string = string,
  Rest extends AnyArgs = AnyArgs,
  Result = unknown
> = (name: Name, ...rest: Rest) => Result;

type AnyArgs = unknown[];
type AnyFunctions = Record<string, (...args: AnyArgs) => unknown>;
