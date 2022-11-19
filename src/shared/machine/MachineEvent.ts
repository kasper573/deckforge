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

export type MachineEventHandlerCollection<MC extends MachineContext> = {
  [EventName in keyof MC["events"]]?: Iterable<
    MachineEventHandler<MC["state"], MC["events"][EventName]>
  >;
};

export type MachineEventHandler<
  State,
  Event extends MachineEvent
> = MutationExpression<State, void, MachineEventInput<Event>>;

export type MachineEventHandlerSelector<MC extends MachineContext> =
  | MachineEventHandlerCollector<MC>
  | MachineEventHandlerGenerator<MC>;

export type MachineEventHandlerCollector<MC extends MachineContext> = <
  EventName extends keyof MC["events"]
>(
  state: MC["state"],
  eventName: EventName
) => Iterable<MachineEventHandler<MC["state"], MC["events"][EventName]>>;

export type MachineEventHandlerGenerator<MC extends MachineContext> = <
  EventName extends keyof MC["events"]
>(
  state: MC["state"],
  eventName: EventName
) => Generator<MachineEventHandler<MC["state"], MC["events"][EventName]>>;
