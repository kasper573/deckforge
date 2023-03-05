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
import { ComponentStore } from "./ComponentStore";
import type {
  ComponentStoreState,
  Imperative,
  OutletEntry,
  OutletRenderer,
} from "./types";

export function createImperative(renderer: OutletRenderer): Imperative {
  const Context = createContext(new ComponentStore());

  return {
    Context,
    Outlet() {
      const store = useContext(Context);
      const [state, setState] = useState(store.state);
      const entries = useMemo(() => outletEntries(state), [state]);
      useEffect(() => store.subscribe(setState), [store]);
      return createElement(renderer, { entries });
    },
    useComponent(component, defaultProps, fixedId) {
      const autoId = useId();
      const id = fixedId ?? autoId;
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

      return useMemo(() => store.interfaceFor(id), [store, id]);
    },
  };
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
