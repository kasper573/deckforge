import type { ComponentType } from "react";
import {
  createContext,
  createElement,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import type {
  ComponentEntry,
  ComponentId,
  ComponentStoreState,
  InstanceEntry,
  InstanceId,
  InstanceInterfaceOptions,
} from "./ComponentStore";
import { ComponentStore } from "./ComponentStore";

export function createImperative({
  renderer,
  autoRemoveInstances = true,
  defaultStore = new ComponentStore(),
}: CreateImperativeOptions) {
  const Context = createContext(defaultStore);

  function useComponent<T extends ComponentEntry>(
    component: T["component"],
    defaultProps: T["defaultProps"] = empty
  ) {
    const id = useId();
    const store = useContext(Context);
    const latest = useRef({ id, store });
    latest.current = { id, store };

    useEffect(() => {
      store.upsertComponent(id, { component, defaultProps });
    }, [store, id, component, defaultProps]);

    useEffect(
      () => () => {
        const { id, store } = latest.current;
        store.markComponentForRemoval(id);
      },
      []
    );

    return useMemo(
      () => store.interfaceFor<T>(id, { autoRemoveInstances }),
      [store, id]
    );
  }

  function Outlet() {
    const store = useContext(Context);
    const [state, setState] = useState(store.state);
    const entries = useMemo(() => outletEntries(state), [state]);
    useEffect(() => store.subscribe(setState), [store]);
    return createElement(renderer, { entries, state });
  }

  return { Context, Outlet, useComponent };
}

function outletEntries(componentEntries: ComponentStoreState): OutletEntry[] {
  return Object.entries(componentEntries).flatMap(
    ([componentId, { instances, ...componentEntry }]) =>
      Object.entries(instances).map(([instanceId, instanceEntry]) => ({
        key: `${componentId}-${instanceId}`,
        ...instanceEntry,
        ...componentEntry,
        componentId,
        instanceId,
      }))
  );
}

const empty = {} as const;

export interface CreateImperativeOptions
  extends Partial<InstanceInterfaceOptions> {
  renderer: OutletRenderer;
  defaultStore?: ComponentStore;
}

export type Imperative = ReturnType<typeof createImperative>;

export type OutletRenderer = ComponentType<{
  entries: OutletEntry[];
  state: ComponentStoreState;
}>;

export type OutletEntryKey = `${ComponentId}-${InstanceId}`;

export interface OutletEntry
  extends InstanceEntry,
    Omit<ComponentEntry, "instances"> {
  componentId: ComponentId;
  instanceId: InstanceId;
  key: OutletEntryKey;
}
