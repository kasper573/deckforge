import type { EventInput } from "./Event";
import type { RuntimeContext } from "./RuntimeContext";
import type { RuntimeState } from "./RuntimeState";

export type SelfExpression<
  RC extends RuntimeContext,
  Output,
  Self
> = PureExpression<Output, { self: Self; state: RuntimeState<RC> }>;

export interface PureExpression<Output = void, Input = void> {
  (input: Input): Output;
}

export interface MutationExpression<
  RC extends RuntimeContext,
  Output = void,
  Input = void
> {
  (state: RuntimeState<RC>, input: Input): Output;
}

export type EventExpression<
  RC extends RuntimeContext,
  EventName extends keyof RC["events"] = keyof RC["events"]
> = MutationExpression<RC, void, EventInput<RC["events"][EventName]>>;

export type EventExpressions<RC extends RuntimeContext> = {
  [EventName in keyof RC["events"]]?: EventExpression<RC, EventName>[];
};
