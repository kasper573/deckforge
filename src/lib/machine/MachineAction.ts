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

export type MachineActionPayload<T extends MachineAction> =
  T extends MachineAction<infer P> ? P : never;

export type MachineActions<Names extends string = string> = Record<
  Names,
  MachineAction
>;

export type MachineEffect<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  State = any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Payload = any
> = (state: State, payload: Payload) => void | MachineEffect<State, Payload>;

export type MachineEffectPayload<T extends MachineEffect> =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  T extends MachineEffect<any, infer P> ? P : never;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyMachineEffects<State = any> = Record<
  string,
  MachineEffect<State>
>;

export type MachineEffects<MC extends MachineContext> = {
  [K in keyof MC["actions"]]: MachineEffect<
    MC["state"],
    MachineActionPayload<MC["actions"][K]>
  >;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type MachineActionsFor<Effects extends MachineEffects<any>> = {
  [K in keyof Effects]: MachineAction<MachineEffectPayload<Effects[K]>>;
};

export type MachineEffectSelector<MC extends MachineContext> =
  | MachineEffectCollector<MC>
  | MachineEffectGenerator<MC>;

export type MachineEffectCollector<MC extends MachineContext> = <
  ActionName extends keyof MC["actions"]
>(
  state: MC["state"],
  actionName: ActionName
) => Iterable<MachineEffect<MC["state"]>> | undefined;

export type MachineEffectGenerator<MC extends MachineContext> = <
  ActionName extends keyof MC["actions"]
>(
  state: MC["state"],
  actionName: ActionName
) => Generator<MachineEffect<MC["state"]>>;

export type MachineMiddleware<MC extends MachineContext> = (
  state: MC["state"],
  action: MachineActionObject<MC, keyof MC["actions"]>,
  next: () => void
) => void;

export type MachineActionObject<
  MC extends MachineContext,
  ActionName extends keyof MC["actions"] = keyof MC["actions"]
> = {
  name: ActionName;
  payload: MachineActionPayload<MC["actions"][ActionName]>;
};

export type MachinePayloadFilter<
  MC extends MachineContext,
  ActionName extends keyof MC["actions"] = keyof MC["actions"]
> = (
  name: ActionName,
  payload: MachineActionPayload<MC["actions"][ActionName]>
) => MachineActionPayload<MC["actions"][ActionName]>;
