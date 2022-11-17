import type { DeepReadonly } from "ts-essentials";
import type { Generics } from "./state/Generics";
import type { RuntimeState } from "./state/RuntimeState";

export interface Runtime<G extends Generics> {
  readonly state: DeepReadonly<RuntimeState<G>>;
  readonly actions: RuntimeActions<G["events"]>;
}

export type RuntimeActions<Events extends string> = {
  [E in Events]: () => void;
};
