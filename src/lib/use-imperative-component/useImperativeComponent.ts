import type { ComponentType } from "react";
import {
  createContext,
  createElement,
  useContext,
  useEffect,
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
}: CreateImperativeOptions) {
  const Context = createContext(new ComponentStore());

  function useComponent<T extends ComponentEntry>(component: T["component"]) {
    return useComponentWith(component, empty);
  }

  function useComponentWith<T extends ComponentEntry>(
    component: T["component"],
    defaultProps: T["defaultProps"]
  ) {
    const id = useMemo(nextComponentId, []);
    const store = useContext(Context);

    useEffect(() => {
      store.upsertComponent(id, { component, defaultProps });
    }, [store, id, component, defaultProps]);

    const latest = useRef({ id, store });
    latest.current = { id, store };
    useEffect(
      () => () => latest.current.store.removeComponent(latest.current.id),
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
    return createElement(renderer, { entries, store });
  }

  return { Context, Outlet, useComponent, useComponentWith };
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

let componentIdCounter = 0;
const nextComponentId = () => (componentIdCounter++).toString();
const empty = {} as const;

export interface CreateImperativeOptions
  extends Partial<InstanceInterfaceOptions> {
  renderer: OutletRenderer;
}

export type Imperative = ReturnType<typeof createImperative>;

export type OutletRenderer = ComponentType<{
  entries: OutletEntry[];
  store: ComponentStore;
}>;

export type OutletEntryKey = `${ComponentId}-${InstanceId}`;

export interface OutletEntry
  extends InstanceEntry,
    Omit<ComponentEntry, "instances"> {
  componentId: ComponentId;
  instanceId: InstanceId;
  key: OutletEntryKey;
}
