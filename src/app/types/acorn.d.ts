declare module "acorn" {
  export function parse(
    code: string,
    options?: { ecmaVersion?: unknown }
  ): unknown;
}
