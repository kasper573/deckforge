import { createContext, useContext } from "react";
import { createStore, useStore } from "zustand";
import type { Runtime } from "./createRuntime";

export const RuntimeContext = createContext<ReactRuntimeAdapter>(
  new Proxy({} as ReactRuntimeAdapter, {
    get() {
      throw new Error("RuntimeContext not provided");
    },
  })
);

export type ReactRuntimeAdapter = ReturnType<typeof createReactRuntimeAdapter>;

export function createReactRuntimeAdapter(runtime: Runtime) {
  const store = createStore<ReactRuntimeState>((set) => ({
    state: runtime.state,
    performAction: (...args) => {
      const result = runtime.performAction(...args);
      set({ state: runtime.state });
      return result;
    },
  }));

  return store;
}

export function useRuntime() {
  const store = useContext(RuntimeContext);
  return useStore(store);
}

type ReactRuntimeState = Pick<Runtime, "state" | "performAction">;
