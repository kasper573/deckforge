import type { ComponentType } from "react";
import type { Result } from "neverthrow";
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

  removeInstance(cid: ComponentId, iid: InstanceId) {
    return this.store.mutate((components) => {
      const component = components[cid];
      delete component.instances[iid];
      if (
        component.markedForRemoval &&
        !Object.keys(component.instances).length
      ) {
        delete components[cid];
      }
    });
  }

  interfaceFor<T extends ComponentEntry>(cid: ComponentId) {
    return (props: Record<string, unknown> = {}) =>
      new Promise<Result<unknown, unknown>>((resolve) => {
        this.store.mutate((state) => {
          const iid = nextId();
          const remove = () => this.removeInstance(cid, iid);
          state[cid].instances[iid] = {
            state: { type: "pending" },
            props,
            resolve: (value, removeDelay = Promise.resolve()) => {
              this.store.mutate((components) => {
                components[cid].instances[iid].state = {
                  type: "resolved",
                  value,
                };
                removeDelay.then(remove);
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
