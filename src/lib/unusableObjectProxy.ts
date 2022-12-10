export function unusableObjectProxy<T>(errorMessage: string): T {
  return new Proxy(
    {},
    {
      get() {
        throw new Error(errorMessage);
      },
    }
  ) as T;
}
