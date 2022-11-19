import type { RuntimeContext } from "./RuntimeContext";
import type { EventInput } from "./Event";
import type { MutationExpression } from "./Expression";

export type EventHandlerExpression<
  RC extends RuntimeContext,
  EventName extends keyof RC["events"] = keyof RC["events"]
> = MutationExpression<RC["state"], void, EventInput<RC["events"][EventName]>>;

export type EventHandlerExpressions<RC extends RuntimeContext> = {
  [EventName in keyof RC["events"]]?: EventHandlerExpression<RC, EventName>[];
};

export type EventHandlerSelector<RC extends RuntimeContext> = <
  EventName extends keyof RC["events"]
>(
  state: RC["state"],
  eventName: EventName
) => Generator<EventHandlerExpression<RC, EventName>>;
