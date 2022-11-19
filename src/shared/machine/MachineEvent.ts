import type { MachineContext } from "./MachineContext";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type MachineEvent<Input = any> = (input: Input) => void;

export type MachineEventRecord<EventNames extends string = string> = Record<
  EventNames,
  MachineEvent
>;

export type MachineEventInput<T extends MachineEvent> = T extends MachineEvent<
  infer I
>
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

export type MachineEventHandler<
  State,
  Event extends MachineEvent
> = MutationExpression<State, void, MachineEventInput<Event>>;

export type MachineEventHandlerSelector<EC extends MachineContext> =
  | MachineEventHandlerCollector<EC>
  | MachineEventHandlerGenerator<EC>;

export type MachineEventHandlerCollector<EC extends MachineContext> = <
  EventName extends keyof EC["events"]
>(
  state: EC["state"],
  eventName: EventName
) => Iterable<MachineEventHandler<EC["state"], EC["events"][EventName]>>;

export type MachineEventHandlerGenerator<EC extends MachineContext> = <
  EventName extends keyof EC["events"]
>(
  state: EC["state"],
  eventName: EventName
) => Generator<MachineEventHandler<EC["state"], EC["events"][EventName]>>;
