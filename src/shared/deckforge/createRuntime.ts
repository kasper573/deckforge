import type { DeepReadonly } from "ts-essentials";
import type { Generics } from "./state/Generics";
import type { Rules } from "./state/Rules";
import type { RuntimeState } from "./state/RuntimeState";
import type { Runtime, RuntimeActions } from "./Runtime";

export function createRuntime<G extends Generics>(
  rules: Rules<G>,
  initialState: RuntimeState<G>
): Runtime<G> {
  return {
    state: initialState as unknown as DeepReadonly<RuntimeState<G>>,
    actions: createRuntimeActions(),
  };
}

export function createRuntimeActions<G extends Generics>() {
  return new Proxy({} as RuntimeActions<G["events"]>, {
    get(target, eventName) {
      return () => {
        console.log(`Event ${String(eventName)} triggered`);
      };
    },
  });
}
