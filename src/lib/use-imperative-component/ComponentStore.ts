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

  removeComponent(id: ComponentId) {
    return this.store.mutate((components) => {
      delete components[id];
    });
  }

  interfaceFor<T extends ComponentEntry>(cid: ComponentId) {
    const { store } = this;

    function trigger<Input>(input: Input, props: Record<string, unknown> = {}) {
      return new Promise<Result<unknown, unknown>>((emitResult) => {
        store.mutate((state) => {
          const iid = nextId();
          state[cid].instances[iid] = {
            state: { type: "pending" },
            input,
            props,
            resolve(value) {
              store.mutate((components) => {
                components[cid].instances[iid].state = {
                  type: "resolved",
                  value,
                };
              });
              emitResult(ok(value));
            },
            reject(error) {
              store.mutate((state) => {
                state[cid].instances[iid].state = {
                  type: "rejected",
                  error,
                };
              });
              emitResult(err(error));
            },
            remove: () =>
              store.mutate((state) => {
                delete state[cid].instances[iid];
              }),
          };
        });
      });
    }

    return trigger;
  }
}

export type ComponentStoreState = Record<ComponentId, ComponentEntry>;

export type ComponentId = string;
export interface ComponentEntry {
  component: ComponentType;
  defaultProps: Record<string, unknown>;
  instances: Record<InstanceId, InstanceEntry>;
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

export type InstanceState =
  | { type: "pending" }
  | { type: "resolved"; value: unknown }
  | { type: "rejected"; error: unknown };

let idCounter = 0;
const nextId = (): ComponentId => (++idCounter).toString();
