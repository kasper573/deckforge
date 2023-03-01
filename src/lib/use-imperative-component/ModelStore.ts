import { Store } from "./Store";

export function createModelStore<
  ModelId extends PropertyKey,
  Model,
  InstanceId extends PropertyKey,
  Instance,
  Input
>(
  initialModels = {} as ModelDefinitions<
    ModelGenerics<ModelId, Model, InstanceId, Instance, Input>
  >,
  createInstance?: ModelInstanceFactory<
    ModelGenerics<ModelId, Model, InstanceId, Instance, Input>
  >
) {
  return new ModelStore(initialModels, createInstance);
}

export type { ModelStore };

class ModelStore<G extends ModelGenerics> extends Store<ModelState<G>> {
  constructor(
    initialModels: ModelDefinitions<G>,
    private readonly createInstance?: ModelInstanceFactory<G>
  ) {
    super(defaultModelState(initialModels));
  }

  addModel(id: G["modelId"], model: G["model"]) {
    return this.mutate((models) => {
      models[id] = defaultModelEntry(model);
    });
  }

  removeModel(id: G["modelId"]) {
    return this.mutate((models) => {
      delete models[id];
    });
  }

  instantiate(
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

function defaultModelState<G extends ModelGenerics>(
  definitions: ModelDefinitions<G>
) {
  return Object.entries(definitions).reduce((acc, [id, model]) => {
    acc[id as G["modelId"]] = defaultModelEntry(model);
    return acc;
  }, {} as ModelState<G>);
}

function defaultModelEntry<G extends ModelGenerics>(
  definition: G["model"]
): ModelEntry<G> {
  return {
    definition,
    instances: {} as InstanceRecord<G>,
  };
}

export type ModelState<G extends ModelGenerics> = Record<
  G["modelId"],
  ModelEntry<G>
>;

export type ModelDefinitions<G extends ModelGenerics> = Record<
  G["modelId"],
  G["model"]
>;

export interface ModelEntry<G extends ModelGenerics> {
  definition: G["model"];
  instances: Record<G["instanceId"], G["instance"]>;
}

export type InstanceRecord<G extends ModelGenerics> = Record<
  G["instanceId"],
  G["instance"]
>;

export type ModelInstanceFactory<G extends ModelGenerics> = (
  model: G["model"],
  input: G["input"]
) => G["instance"];

export interface ModelGenerics<
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
