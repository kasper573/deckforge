import type { ComponentType, Context } from "react";
import {
  createContext,
  createElement,
  Fragment,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type {
  ComponentEntry,
  ComponentStoreState,
  InstanceEntry,
} from "./ComponentStore";
import { ComponentStore } from "./ComponentStore";

export type Imperative = ReturnType<typeof createImperative>;
export type OutletRenderer = ComponentType<ComponentStoreState>;

export function createImperative(outletRenderer?: OutletRenderer) {
  const Context = createContext<ComponentStore>(new ComponentStore());
  return { Context, ...createImperativeUsingContext(Context, outletRenderer) };
}

export function createImperativeUsingContext(
  storeContext: Context<ComponentStore>,
  outletRenderer: OutletRenderer = defaultOutletRenderer
) {
  function useComponent<T extends ComponentEntry>(component: T["component"]) {
    return useComponentWith(component, empty);
  }

  function useComponentWith<T extends ComponentEntry>(
    component: T["component"],
    defaultProps: T["defaultProps"]
  ) {
    const id = useMemo(nextComponentId, []);
    const store = useContext(storeContext);

    useEffect(() => {
      store.upsertComponent(id, { component, defaultProps });
      return () => store.deleteComponent(id);
    }, [store, id, component, defaultProps]);

    return useMemo(() => store.interfaceFor<T>(id), [store, id]);
  }

  function Outlet() {
    const store = useContext(storeContext);
    const [state, setState] = useState(store.state);
    useEffect(() => store.subscribe(setState), [store]);
    return createElement(outletRenderer, state);
  }

  return { Outlet, useComponent, useComponentWith };
}

export function defaultOutletRenderer(state: ComponentStoreState) {
  const elements = Array.from(generateElements(state));
  return createElement(Fragment, {}, ...elements);
}

export function* generateElements(
  { instances, components }: ComponentStoreState,
  shouldIncludeInstance = (instance: InstanceEntry) =>
    instance.state.type === "pending"
): Generator<JSX.Element> {
  for (const [componentId, componentInstances] of Object.entries(instances)) {
    const { component } = components[componentId];
    for (const [instanceId, instance] of Object.entries(componentInstances)) {
      if (shouldIncludeInstance(instance)) {
        yield createElement(component, {
          key: instanceId,
          ...instance.props,
        });
      }
    }
  }
}

let componentIdCounter = 0;
const nextComponentId = () => (componentIdCounter++).toString();

const empty = {} as const;
