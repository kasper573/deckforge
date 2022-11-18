import type { RuntimeState } from "./RuntimeState";
import type { Generics } from "./Generics";

export interface Expression<G extends Generics, Output = void, Input = void> {
  (state: RuntimeState<G>, input: Input): Output;
}

export type EventExpressions<G extends Generics> = Partial<
  Record<G["events"], Expression<G>[]>
>;
