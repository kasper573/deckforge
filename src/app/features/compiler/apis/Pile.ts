import type { ZodType } from "zod";
import { z } from "zod";
import { immerable } from "immer";

export function createPile<T>(items: T[] = []): Pile<T> {
  return new Pile<T>(items);
}

export class Pile<T> implements Iterable<T> {
  [immerable] = true;

  private readonly items: T[];

  get size() {
    return this.items.length;
  }

  [Symbol.iterator]() {
    return this.items[Symbol.iterator]();
  }

  constructor(initialItems: T[] = []) {
    this.items = new Array<T>(...initialItems);
  }

  add(value: T) {
    this.items.push(value);
  }

  clear(): void {
    this.reset();
  }

  reset(newValues: T[] = []): void {
    this.items.splice(0, this.items.length, ...newValues);
  }

  has(value: T): boolean {
    return this.items.includes(value);
  }

  remove(value: T): boolean {
    const index = this.items.indexOf(value);
    if (index !== -1) {
      this.items.splice(index, 1);
      return true;
    }
    return false;
  }

  insert(item: T, atIndex: number): void {
    this.items.splice(atIndex, 0, item);
  }

  take(amount: number): readonly T[] {
    return this.items.splice(0, amount);
  }

  move(amount: number, to: Pile<T>) {
    for (const item of this.take(amount)) {
      to.add(item);
    }
  }

  forEach(callback: (item: T) => void): void {
    this.items.forEach(callback);
  }

  map<M>(callback: (item: T) => M): M[] {
    return this.items.map(callback);
  }

  find(callback: (item: T) => boolean): T | undefined {
    return this.items.find(callback);
  }

  at(index: number): T | undefined {
    return this.items[index];
  }
}

export function zodPile<ItemType extends ZodType>(itemType: ItemType) {
  type ItemPile = Pile<z.infer<ItemType>>;
  type ItemPileMembers = Omit<ItemPile, typeof immerable | "items">;

  const selfType = z.lazy(() => pileType);
  const pileMembers: ZodType<ItemPileMembers> = z.object({
    insert: z.function().args(itemType, z.number()).returns(z.void()),
    take: z.function().args(z.number()).returns(z.array(itemType)),
    move: z.function().args(z.number(), selfType).returns(z.void()),
    map: z
      .function()
      .args(z.function().args(itemType).returns(z.any()))
      .returns(z.array(z.any())),
    find: z
      .function()
      .args(z.function().args(itemType).returns(z.boolean()))
      .returns(itemType.optional()),
    at: z.function().args(z.number()).returns(itemType.optional()),
    [Symbol.iterator]: z.any(),
    size: z.number(),
    add: z.function().args(itemType).returns(z.void()),
    clear: z.function().returns(z.void()),
    reset: z.function().args(z.array(itemType).optional()).returns(z.void()),
    has: z.function().args(itemType).returns(z.boolean()),
    remove: z.function().args(itemType).returns(z.boolean()),
    forEach: z.function().args(z.function().args(itemType).returns(z.void())),
  }) as ZodType<ItemPileMembers>;

  const pileType = pileMembers as ZodType<ItemPile>;

  return pileType;
}
