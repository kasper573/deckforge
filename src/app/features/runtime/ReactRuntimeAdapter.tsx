import type { ReactNode } from "react";
import { createContext, useContext } from "react";
import { createStore, useStore } from "zustand";
import type { Runtime } from "./createRuntime";

export function createReactRuntimeAdapter(runtime: Runtime) {
  const store = createRuntimeStore(runtime);

  return {
    Provider: ({ children }: { children?: ReactNode }) => (
      <RuntimeContext.Provider value={store}>
        {children}
      </RuntimeContext.Provider>
    ),
  };
}

export function useRuntime() {
  const store = useContext(RuntimeContext);
  return useStore(store);
}

const RuntimeContext = createContext<ReactRuntimeStore>(
  new Proxy({} as ReactRuntimeStore, {
    get() {
      throw new Error("RuntimeContext not provided");
    },
  })
);

type ReactRuntimeStore = ReturnType<typeof createRuntimeStore>;

type ReactRuntimeState = Pick<Runtime, "state" | "performAction">;

function createRuntimeStore(runtime: Runtime) {
  return createStore<ReactRuntimeState>((set) => ({
    state: runtime.state,
    performAction: (...args) => {
      const result = runtime.performAction(...args);
      set({ state: runtime.state });
      return result;
    },
  }));
}
