import type { RuntimeContext } from "./state/RuntimeContext";

export interface RuntimeLike<RC extends RuntimeContext> {
  state: RC["state"];
  events: RC["events"];
}
