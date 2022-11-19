import type { EventInput } from "./Event";
import type { Generics } from "./Generics";
import type { RuntimeState } from "./RuntimeState";

export type SelfExpression<G extends Generics, Output, Self> = PureExpression<
  Output,
  { self: Self; state: RuntimeState<G> }
>;

export interface PureExpression<Output = void, Input = void> {
  (input: Input): Output;
}

export interface MutationExpression<
  G extends Generics,
  Output = void,
  Input = void
> {
  (state: RuntimeState<G>, input: Input): Output;
}

export type EventExpression<
  G extends Generics,
  EventName extends keyof G["events"] = keyof G["events"]
> = MutationExpression<G, void, EventInput<G["events"][EventName]>>;

export type EventExpressions<G extends Generics> = {
  [EventName in keyof G["events"]]?: EventExpression<G, EventName>[];
};
