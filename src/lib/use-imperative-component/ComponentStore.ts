import type { StoreListener } from "./Store";
import { Store } from "./Store";
import type {
  ComponentEntry,
  ComponentId,
  ComponentStoreState,
  InstanceId,
  InstanceInterfaceFor,
} from "./types";

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

  interfaceFor<
    ResolutionValue,
    AdditionalComponentProps,
    DefaultProps extends Partial<AdditionalComponentProps>
  >(
    componentId: ComponentId
  ): InstanceInterfaceFor<
    ResolutionValue,
    AdditionalComponentProps,
    DefaultProps
  > {
    return (props) =>
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

let idCounter = 0;
const nextId = (): ComponentId => (++idCounter).toString();
