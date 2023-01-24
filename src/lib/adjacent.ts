export function adjacent<T>(
  list: T[] | undefined,
  item: T,
  offset: -1 | 1 = 1
): T | undefined {
  if (list === undefined) {
    return;
  }
  if (list.length === 1) {
    return;
  }
  const index = list.indexOf(item);
  if (index === -1) {
    return;
  }
  if (index === 0) {
    return list[1];
  }
  if (index === list.length - 1) {
    return list[index - 1];
  }
  return list[index + offset];
}
