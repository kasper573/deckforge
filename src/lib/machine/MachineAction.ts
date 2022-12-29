import type { MachineContext } from "./MachineContext";

export type MachineAction<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Payload = any
> = (...args: SingleOrNoArgument<Payload>) => void;

type SingleOrNoArgument<T> = void extends T
  ? []
  : undefined extends T
  ? [] | [T]
  : [T];

export type MachinePayload<T> = T extends MachineEffect<any, infer P>
  ? P
  : T extends MachineAction<infer P>
  ? P
  : never;

export type MachineActions<Names extends string = string> = Record<
  Names,
  MachineAction
>;

export type MachineEffect<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  State = any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Payload = any
> = (state: State, payload: Payload) => void;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyMachineEffects<State = any> = Record<
  string,
  MachineEffect<State>
>;

export type MachineEffects<MC extends MachineContext> = {
  [K in keyof MC["actions"]]: MachineEffect<
    MC["state"],
    MachinePayload<MC["actions"][K]>
  >;
};

export type MachineActionsFor<Effects extends MachineEffects<any>> = {
  [K in keyof Effects]: MachineAction<MachinePayload<Effects[K]>>;
};

export type MachineEffectSelector<MC extends MachineContext> =
  | MachineEffectCollector<MC>
  | MachineEffectGenerator<MC>;

export type MachineEffectCollector<MC extends MachineContext> = <
  ActionName extends keyof MC["actions"]
>(
  state: MC["state"],
  actionName: ActionName
) => Iterable<MachineEffect<MC["state"], unknown>> | undefined;

export type MachineEffectGenerator<MC extends MachineContext> = <
  ActionName extends keyof MC["actions"]
>(
  state: MC["state"],
  actionName: ActionName
) => Generator<MachineEffect<MC["state"], unknown>>;
