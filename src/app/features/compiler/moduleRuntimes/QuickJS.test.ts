import type { QuickJSWASMModule } from "quickjs-emscripten";
import { getQuickJS } from "quickjs-emscripten";
import { generateModuleRuntimeTests } from "./testUtils";
import { createQuickJSModuleRuntime } from "./QuickJS";

describe("QuickJS", () => {
  let quickJS: QuickJSWASMModule;
  beforeAll(async () => {
    quickJS = await getQuickJS();
  });

  generateModuleRuntimeTests(() => createQuickJSModuleRuntime(quickJS));
});
