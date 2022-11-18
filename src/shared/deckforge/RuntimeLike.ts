import type { DeepReadonly } from "ts-essentials";
import type { Generics } from "./state/Generics";
import type { RuntimeState } from "./state/RuntimeState";

export interface RuntimeLike<G extends Generics> {
  readonly state: DeepReadonly<RuntimeState<G>>;
  readonly events: Readonly<G["events"]>;
}
