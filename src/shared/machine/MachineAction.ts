import type { MachineContext } from "./MachineContext";

export type AnyMachineAction<MC extends MachineContext = MachineContext> =
  MC["actions"][keyof MC["actions"]];

export type MachineAction<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  State = any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Input = any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Output = any
> = (state: State, input: Input) => Output;

export type MachineActionRecord<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  State = any,
  Names extends string = string
> = Record<Names, MachineAction<State>>;

export type MachineActionState<T extends MachineAction> =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  T extends MachineAction<infer State> ? State : never;

export type MachineActionInput<T extends MachineAction> =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  T extends MachineAction<any, infer Input> ? Input : never;

export type MachineActionOutput<T extends MachineAction> =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  T extends MachineAction<any, any, infer Output> ? Output : never;

export type AnyMachineReaction<MC extends MachineContext = MachineContext> =
  MachineReaction<AnyMachineAction<MC>>;

export type MachineReaction<Action extends MachineAction> = (
  state: MachineActionState<Action>,
  payload: MachineReactionPayload<Action>
) => void;

export interface MachineReactionPayload<Action extends MachineAction> {
  input: MachineActionInput<Action>;
  output: MachineActionOutput<Action>;
}

export type MachineReactionMap<MC extends MachineContext> = {
  [ActionName in keyof MC["actions"]]?: MachineReaction<
    MC["actions"][ActionName]
  >;
};

export type MachineReactionCollection<MC extends MachineContext> = {
  [ActionName in keyof MC["actions"]]?: Iterable<
    MachineReaction<MC["actions"][ActionName]>
  >;
};

export type MachineReactionSelector<MC extends MachineContext> =
  | MachineReactionCollector<MC>
  | MachineReactionGenerator<MC>;

export type MachineReactionCollector<MC extends MachineContext> = <
  ActionName extends keyof MC["actions"]
>(
  state: MC["state"],
  actionName: ActionName
) => Iterable<MachineReaction<MC["actions"][ActionName]>> | undefined;

export type MachineReactionGenerator<MC extends MachineContext> = <
  ActionName extends keyof MC["actions"]
>(
  state: MC["state"],
  actionName: ActionName
) => Generator<MachineReaction<MC["actions"][ActionName]>>;
