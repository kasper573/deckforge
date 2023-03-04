import type { ComponentType } from "react";
import type { StoreListener } from "./Store";
import { Store } from "./Store";

export class ComponentStore {
  constructor(private store = new Store<ComponentStoreState>({})) {
    this.subscribe = this.store.subscribe.bind(this.store);
  }

  get state() {
    return this.store.state;
  }

  subscribe(listener: StoreListener<ComponentStoreState>) {
    return this.store.subscribe(listener);
  }

  upsertComponent(id: ComponentId, entry: Omit<ComponentEntry, "instances">) {
    return this.store.mutate((components) => {
      if (!components[id]) {
        components[id] = { instances: {}, ...entry };
      } else {
        Object.assign(components[id], entry);
      }
    });
  }

  markComponentForRemoval(id: ComponentId) {
    return this.store.mutate((components) => {
      components[id].markedForRemoval = true;
    });
  }

  removeInstance(componentId: ComponentId, instanceId: InstanceId) {
    return this.store.mutate((components) => {
      const component = components[componentId];
      delete component.instances[instanceId];
      if (
        component.markedForRemoval &&
        !Object.keys(component.instances).length
      ) {
        delete components[componentId];
      }
    });
  }

  interfaceFor<T extends ComponentEntry>(componentId: ComponentId) {
    return (props: Record<string, unknown> = {}) =>
      new Promise((resolve) => {
        this.store.mutate((state) => {
          const instanceId = nextId();
          state[componentId].instances[instanceId] = {
            state: { type: "pending" },
            props,
            resolve: (value, removeDelay = Promise.resolve()) => {
              this.store.mutate((components) => {
                components[componentId].instances[instanceId].state = {
                  type: "resolved",
                  value,
                };
                removeDelay.then(() =>
                  this.removeInstance(componentId, instanceId)
                );
              });
              resolve(value);
            },
          };
        });
      });
  }
}

export type ComponentStoreState = Record<ComponentId, ComponentEntry>;

export type ComponentId = string;
export interface ComponentEntry {
  component: ComponentType;
  defaultProps: Record<string, unknown>;
  instances: Record<InstanceId, InstanceEntry>;
  markedForRemoval?: boolean;
}

export type InstanceId = string;
export interface InstanceEntry {
  state: InstanceState;
  props: Record<string, unknown>;
  resolve: (value: unknown, removeDelay?: Promise<unknown>) => void;
}

export type InstanceState =
  | { type: "pending" }
  | { type: "resolved"; value: unknown };

let idCounter = 0;
const nextId = (): ComponentId => (++idCounter).toString();
