import type { DeepReadonly } from "ts-essentials";
import type { EventInput, EventOutput } from "./Event";
import type { Generics } from "./Generics";
import type { RuntimeState } from "./RuntimeState";

export interface ReadonlyExpression<
  G extends Generics,
  Output = void,
  Input = void
> {
  (state: DeepReadonly<RuntimeState<G>>, input: Input): Output;
}

export interface Expression<G extends Generics, Output = void, Input = void> {
  (state: RuntimeState<G>, input: Input): Output;
}

export type EventExpression<
  G extends Generics,
  EventName extends keyof G["events"][EventName] = keyof G["events"]
> = Expression<
  G,
  EventOutput<G["events"][EventName]>,
  EventInput<G["events"][EventName]>
>;

export type EventExpressions<G extends Generics> = {
  [EventName in keyof G["events"]]?: EventExpression<G, EventName>[];
};
