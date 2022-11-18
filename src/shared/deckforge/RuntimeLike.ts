import type { Immutable } from "../Immutable";
import type { Generics } from "./state/Generics";
import type { RuntimeState } from "./state/RuntimeState";

export interface RuntimeLike<G extends Generics> {
  readonly state: Immutable<RuntimeState<G>>;
  readonly events: Readonly<G["events"]>;
}
