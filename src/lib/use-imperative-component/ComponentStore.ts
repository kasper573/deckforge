import type { ComponentType } from "react";
import type { StoreListener } from "./Store";
import { Store } from "./Store";

export class ComponentStore {
  constructor(
    private store = new Store<ComponentStoreState>({
      components: {},
      instances: {},
    })
  ) {
    this.subscribe = this.store.subscribe.bind(this.store);
  }

  get state() {
    return this.store.state;
  }

  subscribe(listener: StoreListener<ComponentStoreState>) {
    return this.store.subscribe(listener);
  }

  upsertComponent(id: ComponentId, entry: ComponentEntry) {
    return this.store.mutate(({ components }) => {
      components[id] = entry;
    });
  }

  deleteComponent(id: ComponentId) {
    return this.store.mutate(({ components }) => {
      delete components[id];
    });
  }

  interfaceFor<T extends ComponentEntry>(componentId: ComponentId) {
    const { store } = this;

    function trigger<Input>(input: Input) {
      return new Promise((resolve, reject) => {
        store.mutate(({ components, instances }) => {
          const entry = components[componentId];
          if (!entry) {
            throw new Error(`No component with id ${componentId} found`);
          }
        });
      });
    }

    return trigger;
  }
}

export type ComponentStoreState = {
  components: Record<ComponentId, ComponentEntry>;
  instances: Record<ComponentId, Record<InstanceId, InstanceEntry>>;
};

export type ComponentId = string;
export interface ComponentEntry {
  component: ComponentType;
  defaultProps: Record<string, unknown>;
}

export type InstanceId = string;
export interface InstanceEntry {
  input: unknown;
  state: InstanceState;
  props: Record<string, unknown>;
}
export type InstanceState =
  | { type: "pending" }
  | { type: "resolved"; value: unknown }
  | { type: "rejected"; error: unknown };

let idCounter = 0;
const nextId = (): ComponentId => (++idCounter).toString();
