import type { MachineContext } from "./MachineContext";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type MachineAction<Input = any, Output = any> = (input: Input) => Output;

export type MachineActionRecord<Names extends string = string> = Record<
  Names,
  MachineAction
>;

export type MachineActionInput<T extends MachineAction> = Parameters<T>[0];

export type MachineActionOutput<T extends MachineAction> = ReturnType<T>;

export type AnyMachineReaction<MC extends MachineContext> = MachineReaction<
  MC["state"],
  MC["actions"][keyof MC["actions"]]
>;

export type MachineReaction<State, Action extends MachineAction> = (
  state: State,
  input: MachineActionInput<Action>
) => void;

export type MachineReactionMap<MC extends MachineContext> = {
  [ActionName in keyof MC["actions"]]?: MachineReaction<
    MC["state"],
    MC["actions"][ActionName]
  >;
};

export type MachineReactionCollection<MC extends MachineContext> = {
  [ActionName in keyof MC["actions"]]?: Iterable<
    MachineReaction<MC["state"], MC["actions"][ActionName]>
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
) =>
  | Iterable<MachineReaction<MC["state"], MC["actions"][ActionName]>>
  | undefined;

export type MachineReactionGenerator<MC extends MachineContext> = <
  ActionName extends keyof MC["actions"]
>(
  state: MC["state"],
  actionName: ActionName
) => Generator<MachineReaction<MC["state"], MC["actions"][ActionName]>>;
