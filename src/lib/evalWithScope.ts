export function evalWithScope(code: string, scope: Record<string, unknown>) {
  const scopeKeys = Object.keys(scope);
  const scopeValues = Object.values(scope);
  return new Function(...scopeKeys, code)(...scopeValues);
}
