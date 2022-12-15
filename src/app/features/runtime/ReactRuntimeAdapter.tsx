import { createContext, useContext, useEffect, useMemo } from "react";
import { createStore, useStore } from "zustand";
import type { Runtime } from "./createRuntime";

export function useRuntimeState<Selection>(
  selector: (state: ReactRuntimeState["state"]) => Selection
) {
  const store = useContext(RuntimeContext);
  return useStore(store, ({ state }) => selector(state));
}

export function useRuntimeAction() {
  const store = useContext(RuntimeContext);
  return useStore(store, ({ performAction }) => performAction);
}

export const RuntimeContext = createContext<ReactRuntimeStore>(
  new Proxy({} as ReactRuntimeStore, {
    get() {
      throw new Error("RuntimeContext not provided");
    },
  })
);

type ReactRuntimeStore = ReturnType<typeof useCreateRuntimeStore>;

type ReactRuntimeState = Pick<Runtime, "state" | "performAction">;

export function useCreateRuntimeStore(runtime: Runtime) {
  const store = useMemo(
    () =>
      createStore<ReactRuntimeState>(() => ({
        state: runtime.state,
        performAction: (...args) => runtime.performAction(...args),
      })),
    [runtime]
  );

  useEffect(
    () => runtime.subscribe((state) => store.setState({ state })),
    [runtime, store]
  );

  return store;
}
