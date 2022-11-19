// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyEvent<Input = any> = (input: Input) => void;

export type EventInput<T extends AnyEvent> = T extends AnyEvent<infer I>
  ? I
  : never;

export type EventRecord<EventNames extends string = string> = Record<
  EventNames,
  AnyEvent
>;
