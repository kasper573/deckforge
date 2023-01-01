import type { ZodType } from "zod";
import { z } from "zod";

export function createPile<T>(initialItems: T[] = []) {
  const items = new Array<T>(...initialItems);
  const pile: Pile<T> = {
    add(item) {
      items.push(item);
    },
    insert(item, atIndex: number) {
      items.splice(atIndex, 0, item);
    },
    take(amount: number) {
      return items.splice(0, amount);
    },
    move(amount, to) {
      for (const item of pile.take(amount)) {
        to.add(item);
      }
    },
    clear() {
      items.splice(0, items.length);
    },
    remove(value: T) {
      const index = items.indexOf(value);
      if (index !== -1) {
        items.splice(index, 1);
        return true;
      }
      return false;
    },
    has(value: T) {
      return items.includes(value);
    },
    forEach(callback) {
      items.forEach(callback);
    },
    find(callback) {
      return items.find(callback);
    },
    map(callback) {
      return items.map(callback);
    },
    at(index) {
      return items[index];
    },
    get size() {
      return items.length;
    },
    [Symbol.iterator]() {
      return items[Symbol.iterator]();
    },
  };

  return pile;
}

export interface Pile<T>
  extends Pick<Set<T>, "clear" | "has" | "size">,
    Iterable<T> {
  add(item: T): void;
  insert(item: T, atIndex: number): void;
  take(amount: number): T[];
  move(amount: number, to: Pile<T>): void;
  remove(value: T): boolean;
  forEach(callback: (item: T) => void): void;
  map<M>(callback: (item: T) => M): M[];
  at(index: number): T | undefined;
  find(callback: (item: T) => boolean): T | undefined;
}

export function zodPile<ItemType extends ZodType>(itemType: ItemType) {
  const selfType = z.lazy(() => pileType);
  const pileType: ZodType<Pile<z.infer<ItemType>>> = z.object({
    add: z.function().args(itemType).returns(z.void()),
    insert: z.function().args(itemType, z.number()).returns(z.void()),
    take: z.function().args(z.number()).returns(z.array(itemType)),
    move: z.function().args(z.number(), selfType).returns(z.void()),
    clear: z.function().returns(z.void()),
    remove: z.function().args(itemType).returns(z.boolean()),
    forEach: z.function().args(z.function().args(itemType)),
    find: z
      .function()
      .args(z.function().args(itemType).returns(z.boolean()))
      .returns(itemType.optional()),
    map: z.function().args(z.function().args(itemType)).returns(z.any()),
    at: z.function().args(z.number()).returns(itemType.optional()),
    has: z.function().args(itemType).returns(z.boolean()),
    size: z.number(),
    [Symbol.iterator]: z.function().returns(z.any()),
  });

  return pileType;
}
