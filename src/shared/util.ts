export function pull<K, V>(map: Map<K, V>, key: K): V {
  if (!map.has(key)) {
    throw new Error("Key not found");
  }
  return map.get(key) as V;
}
