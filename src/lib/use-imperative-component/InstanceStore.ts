import { Store } from "./Store";

export function createInstanceStore<
  ModelId extends PropertyKey,
  Model,
  InstanceId extends PropertyKey,
  Instance,
  Input
>(
  initialModels = {} as ModelDefinitions<ModelId, Model>,
  createInstance?: InstanceFactory<Model, Input, Instance>
) {
  return new InstanceStore<
    InstanceStoreGenerics<ModelId, Model, InstanceId, Instance, Input>
  >(initialModels, createInstance);
}

export type { InstanceStore };

class InstanceStore<G extends InstanceStoreGenerics> extends Store<
  ModelState<G>
> {
  constructor(
    initialModels: inferModelDefinitions<G>,
    private readonly createInstance?: inferInstanceFactory<G>
  ) {
    super(defaultModelState(initialModels));
  }

  upsertModel(id: G["modelId"], model: G["model"]) {
    return this.mutate((models) => {
      models[id] = defaultModelEntry(model);
    });
  }

  deleteModel(id: G["modelId"]) {
    return this.mutate((models) => {
      delete models[id];
    });
  }

  upsertInstance(
    modelId: G["modelId"],
    instanceId: G["instanceId"],
    input: G["input"]
  ) {
    return this.mutate((models) => {
      const model = models[modelId];
      if (!model) {
        throw new Error(`No model with id ${String(modelId)} found`);
      }
      if (!this.createInstance) {
        throw new Error("No createInstance function provided");
      }
      const instance = this.createInstance(model.definition, input);
      model.instances[instanceId] = instance;
    });
  }

  destroyInstance(modelId: G["modelId"], instanceId: G["instanceId"]) {
    return this.mutate((models) => {
      const model = models[modelId];
      if (!model) {
        throw new Error(`No model with id ${String(modelId)} found`);
      }
      delete model.instances[instanceId];
    });
  }
}

function defaultModelState<G extends InstanceStoreGenerics>(
  definitions: inferModelDefinitions<G>
) {
  return Object.entries(definitions).reduce((acc, [id, model]) => {
    acc[id as G["modelId"]] = defaultModelEntry(model);
    return acc;
  }, {} as ModelState<G>);
}

function defaultModelEntry<G extends InstanceStoreGenerics>(
  definition: G["model"]
): ModelEntry<G> {
  return {
    definition,
    instances: {} as InstanceRecord<G>,
  };
}

export type ModelState<G extends InstanceStoreGenerics> = Record<
  G["modelId"],
  ModelEntry<G>
>;

export type inferModelDefinitions<G extends InstanceStoreGenerics> =
  ModelDefinitions<G["modelId"], G["model"]>;

export type ModelDefinitions<Id extends PropertyKey, Model> = Record<Id, Model>;

export interface ModelEntry<G extends InstanceStoreGenerics> {
  definition: G["model"];
  instances: Record<G["instanceId"], G["instance"]>;
}

export type InstanceRecord<G extends InstanceStoreGenerics> = Record<
  G["instanceId"],
  G["instance"]
>;

export type inferInstanceFactory<G extends InstanceStoreGenerics> =
  InstanceFactory<G["model"], G["input"], G["instance"]>;

export type InstanceFactory<Model, Input, Instance> = (
  model: Model,
  input: Input
) => Instance;

export interface InstanceStoreGenerics<
  ModelId extends PropertyKey = PropertyKey,
  Model = unknown,
  InstanceId extends PropertyKey = PropertyKey,
  Instance = unknown,
  Input = unknown
> {
  modelId: ModelId;
  model: Model;
  instanceId: InstanceId;
  instance: Instance;
  input: Input;
}
