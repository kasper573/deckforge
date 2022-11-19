import type { RuntimeContext } from "./RuntimeContext";

export type SelfExpression<
  RC extends RuntimeContext,
  Output,
  Self
> = PureExpression<Output, { self: Self; state: RC["state"] }>;

export interface PureExpression<Output = void, Input = void> {
  (input: Input): Output;
}

export interface MutationExpression<State, Output = void, Input = void> {
  (state: State, input: Input): Output;
}
