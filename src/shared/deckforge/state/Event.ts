// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyEvent<Input = any, Output = any> = (input: Input) => Output;

export type EventInput<T extends AnyEvent> = Parameters<T>[0];

export type EventOutput<T extends AnyEvent> = ReturnType<T>;

export type EventRecord<EventNames extends string = string> = Record<
  EventNames,
  AnyEvent
>;
