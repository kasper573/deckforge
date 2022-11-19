// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyEvent<Input = any> = (input: Input) => void;

export type EventRecord<EventNames extends string = string> = Record<
  EventNames,
  AnyEvent
>;

export type EventInput<T extends AnyEvent> = T extends AnyEvent<infer I>
  ? I
  : never;

export type SelfExpression<State, Output, Self> = PureExpression<
  Output,
  { self: Self; state: State }
>;

export interface PureExpression<Output = void, Input = void> {
  (input: Input): Output;
}

export interface MutationExpression<State, Output = void, Input = void> {
  (state: State, input: Input): Output;
}

export type EventHandler<State, Event extends AnyEvent> = MutationExpression<
  State,
  void,
  EventInput<Event>
>;

export type EventHandlerSelector<State, Events extends EventRecord> =
  | EventHandlerCollector<State, Events>
  | EventHandlerGenerator<State, Events>;

export type EventHandlerCollector<State, Events extends EventRecord> = <
  EventName extends keyof Events
>(
  state: State,
  eventName: EventName
) => Iterable<EventHandler<State, Events[EventName]>>;

export type EventHandlerGenerator<State, Events extends EventRecord> = <
  EventName extends keyof Events
>(
  state: State,
  eventName: EventName
) => Generator<EventHandler<State, Events[EventName]>>;
