export type Immutable<T> = T extends Primitive
  ? T
  : T extends Array<infer U>
  ? ReadonlyArray<U>
  : T extends Map<infer K, infer V>
  ? ReadonlyMap<K, V>
  : Readonly<T>;

// eslint-disable-next-line @typescript-eslint/ban-types
type Primitive = undefined | null | boolean | string | number | Function;

type DeepImmutable<T> = T extends Primitive
  ? T
  : T extends Array<infer U>
  ? DeepImmutableArray<U>
  : T extends Map<infer K, infer V>
  ? DeepImmutableMap<K, V>
  : DeepImmutableObject<T>;

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface DeepImmutableArray<T> extends ReadonlyArray<DeepImmutable<T>> {}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface DeepImmutableMap<K, V>
  extends ReadonlyMap<DeepImmutable<K>, DeepImmutable<V>> {}

type DeepImmutableObject<T> = {
  readonly [K in keyof T]: DeepImmutable<T[K]>;
};
