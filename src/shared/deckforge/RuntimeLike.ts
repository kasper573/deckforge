import type { RuntimeContext } from "./state/RuntimeContext";
import type { RuntimeState } from "./state/RuntimeState";

export interface RuntimeLike<G extends RuntimeContext> {
  readonly state: RuntimeState<G>;
  readonly events: Readonly<G["events"]>;
}
