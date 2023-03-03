import type { ComponentType } from "react";
import type { Result } from "neverthrow";
import { err, ok } from "neverthrow";
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
        delete components[iid];
      }
    });
  }

  interfaceFor<T extends ComponentEntry>(
    cid: ComponentId,
    { autoRemoveInstances }: InstanceInterfaceOptions
  ) {
    return <Input>(input: Input, props: Record<string, unknown> = {}) =>
      new Promise<Result<unknown, unknown>>((emitResult) => {
        this.store.mutate((state) => {
          const iid = nextId();
          const remove = () => this.removeInstance(cid, iid);
          state[cid].instances[iid] = {
            state: { type: "pending" },
            input,
            props,
            resolve: (value) => {
              this.store.mutate((components) => {
                components[cid].instances[iid].state = {
                  type: "resolved",
                  value,
                };
                if (autoRemoveInstances) {
                  remove();
                }
              });
              emitResult(ok(value));
            },
            reject: (error) => {
              this.store.mutate((components) => {
                components[cid].instances[iid].state = {
                  type: "rejected",
                  error,
                };
                if (autoRemoveInstances) {
                  remove();
                }
              });
              emitResult(err(error));
            },
            remove,
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
  input: unknown;
  state: InstanceState;
  props: Record<string, unknown>;
  resolve: (value: unknown) => void;
  reject: (error: unknown) => void;
  remove: () => void;
}

export interface InstanceInterfaceOptions {
  autoRemoveInstances: boolean;
}

export type InstanceState =
  | { type: "pending" }
  | { type: "resolved"; value: unknown }
  | { type: "rejected"; error: unknown };

let idCounter = 0;
const nextId = (): ComponentId => (++idCounter).toString();
