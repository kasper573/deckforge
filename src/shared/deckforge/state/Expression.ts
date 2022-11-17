export interface Expression<Output = void, Input = void> {
  (input: Input): Output;
}

export type EventExpressions<Events extends string> = Partial<
  Record<Events, Expression[]>
>;
