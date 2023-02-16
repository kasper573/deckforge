export function createMutateFn() {
  return function mutate(a: unknown, b: unknown) {
    if (!(isObject(a) && isObject(b))) {
      // A or B is a primitive, which means A can't be mutated.
      // B is the new value, returning leads to a mutation during recursion.
      return b;
    }

    const reverseKeys = unique([
      ...Object.keys(a),
      ...Object.keys(b),
    ]).reverse();

    const targetIsArray = Array.isArray(a);

    for (const key of reverseKeys) {
      const removed = !(key in b);
      const added = !(key in a);
      const mutated = !removed && !added;
      if (removed) {
        delete a[key];
        if (targetIsArray) {
          a.splice(Number(key), 1);
        }
      } else if (added) {
        a[key] = b[key];
      } else if (mutated) {
        const newValue = mutate(a[key], b[key]);
        if (newValue !== a[key]) {
          a[key] = newValue;
        }
      }
    }
    return a;
  };

  function isObject(value: unknown): value is Record<string, unknown> {
    return value !== null && typeof value === "object";
  }

  function unique<T>(array: T[]): T[] {
    const seen: T[] = [];
    for (const item of array) {
      if (seen.indexOf(item) === -1) {
        seen.push(item);
      }
    }
    return seen;
  }
}
