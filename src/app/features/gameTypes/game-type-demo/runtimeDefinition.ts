import { defineRuntime } from "../../compiler/defineRuntime";
import type {
  RuntimeGenericsFor,
  RuntimeMachineContext,
} from "../../compiler/types";
import type { inferFromZodShape } from "../../../../lib/zod-extensions/ZodShapeFor";

export const runtimeDefinition = defineRuntime({
  playerProperties: {},
  cardProperties: {},
  actions: () => ({}),
  globalProperties: () => ({}),
  initialState: () => ({
    players: [],
    decks: [],
    properties: {},
  }),
});

export type DemoDefinition = typeof runtimeDefinition;
export type DemoGenerics = RuntimeGenericsFor<DemoDefinition>;
export type DemoTypes = inferFromZodShape<DemoDefinition>;
export type DemoMachineContext = RuntimeMachineContext<DemoGenerics>;
