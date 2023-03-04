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
} from "./ComponentStore";
import { ComponentStore } from "./ComponentStore";

export function createImperative(renderer: OutletRenderer) {
  const Context = createContext(new ComponentStore());

  function useComponent<T extends ComponentEntry>(
    component: T["component"],
    defaultProps: T["defaultProps"] = empty
  ) {
    const id = useId();
    return useComponentImpl(component, defaultProps, id);
  }

  useComponent.fixed = (fixedId: ComponentId) => {
    function useComponentWithFixedId<T extends ComponentEntry>(
      component: T["component"],
      defaultProps: T["defaultProps"] = empty
    ) {
      return useComponentImpl(component, defaultProps, fixedId);
    }
    return useComponentWithFixedId;
  };

  function useComponentImpl<T extends ComponentEntry>(
    component: T["component"],
    defaultProps: T["defaultProps"] = empty,
    id: ComponentId
  ) {
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

    return useMemo(() => store.interfaceFor<T>(id), [store, id]);
  }

  function Outlet() {
    const store = useContext(Context);
    const [state, setState] = useState(store.state);
    const entries = useMemo(() => outletEntries(state), [state]);
    useEffect(() => store.subscribe(setState), [store]);
    return createElement(renderer, { entries });
  }

  return { Context, Outlet, useComponent };
}

function outletEntries(componentEntries: ComponentStoreState): OutletEntry[] {
  return Object.entries(componentEntries).flatMap(
    ([componentId, { instances, ...component }]) =>
      Object.entries(instances).map(([instanceId, instance]) => ({
        key: `${componentId}-${instanceId}`,
        ...instance,
        ...component,
      }))
  );
}

const empty = {} as const;

export type Imperative = ReturnType<typeof createImperative>;
export type OutletRenderer = ComponentType<{ entries: OutletEntry[] }>;
export type OutletEntryKey = `${ComponentId}-${InstanceId}`;

export interface OutletEntry
  extends InstanceEntry,
    Pick<ComponentEntry, "component" | "defaultProps"> {
  key: OutletEntryKey;
}
