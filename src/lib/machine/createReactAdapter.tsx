import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useMemo } from "react";
import { createStore, useStore } from "zustand";
import type { MachineContext } from "./MachineContext";
import type { Machine } from "./Machine";

export function createReactAdapter<Context extends MachineContext>() {
  type Runtime = Machine<Context>;

  function useRuntimeState<Selection>(
    selector: (state: Runtime["state"]) => Selection
  ) {
    const store = useContext(RuntimeStoreContext);
    return useStore(store, ({ state }) => selector(state));
  }

  function useRuntimeActions() {
    const store = useContext(RuntimeStoreContext);
    return useStore(store, ({ actions }) => actions);
  }

  const RuntimeStoreContext = createContext<RuntimeContextProps>(
    new Proxy({} as RuntimeContextProps, {
      get() {
        throw new Error("RuntimeContext not provided");
      },
    })
  );

  type RuntimeContextProps = ReturnType<typeof useRuntimeStore>;
  function useRuntimeStore(runtime: Runtime) {
    const store = useMemo(() => createStore<Runtime>(() => runtime), [runtime]);
    useEffect(
      () => runtime.subscribe((state) => store.setState({ state })),
      [runtime, store]
    );
    return store;
  }

  function RuntimeProvider({
    value: runtime,
    children,
  }: {
    value: Runtime;
    children?: ReactNode;
  }) {
    const context = useRuntimeStore(runtime);
    return (
      <RuntimeStoreContext.Provider value={context}>
        {children}
      </RuntimeStoreContext.Provider>
    );
  }

  return {
    useRuntimeState,
    useRuntimeActions,
    RuntimeProvider,
  };
}
