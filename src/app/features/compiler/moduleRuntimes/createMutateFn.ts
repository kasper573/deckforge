export function createMutateFn() {
  return function mutate(a: unknown, b: unknown) {
    if (Array.isArray(a) && Array.isArray(b)) {
      const maxLength = Math.max(a.length, b.length);
      for (let i = 0; i < maxLength; i++) {
        a[i] = mutate(a[i], b[i]);
      }
      return a;
    }
    if (isObject(a) && isObject(b)) {
      for (const key of Object.keys(b)) {
        const nextValue = mutate(a[key], b[key]);
        try {
          a[key] = nextValue;
        } catch {
          // ignore read-only errors
        }
      }
      return a;
    }
    return b;
  };

  function isObject(obj: unknown): obj is Record<string, unknown> {
    return obj !== null && typeof obj === "object";
  }
}
