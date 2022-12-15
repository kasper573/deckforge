import { createContext, useContext, useEffect, useMemo } from "react";
import { createStore, useStore } from "zustand";
import { pick } from "lodash";
import type { Runtime } from "./Runtime";

export function useRuntimeState<Selection>(
  selector: (state: ReactRuntimeMembers["state"]) => Selection
) {
  const store = useContext(RuntimeContext);
  return useStore(store, ({ state }) => selector(state));
}

export function useRuntimeActions() {
  const store = useContext(RuntimeContext);
  return useStore(store, ({ actions }) => actions);
}

export const RuntimeContext = createContext<ReactRuntimeStore>(
  new Proxy({} as ReactRuntimeStore, {
    get() {
      throw new Error("RuntimeContext not provided");
    },
  })
);

type ReactRuntimeStore = ReturnType<typeof useCreateRuntimeStore>;

type ReactRuntimeMembers = Pick<Runtime, "state" | "actions">;

export function useCreateRuntimeStore(runtime: Runtime) {
  const store = useMemo(
    () =>
      createStore<ReactRuntimeMembers>(() =>
        pick(runtime, ["state", "actions"])
      ),
    [runtime]
  );

  useEffect(
    () => runtime.subscribe((state) => store.setState({ state })),
    [runtime, store]
  );

  return store;
}
