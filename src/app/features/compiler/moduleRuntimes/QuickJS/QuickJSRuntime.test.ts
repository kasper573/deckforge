import type { QuickJSWASMModule } from "quickjs-emscripten";
import { getQuickJS } from "quickjs-emscripten";
import { generateModuleRuntimeTests } from "../tests";
import { createQuickJSRuntime } from "./QuickJSRuntime";

describe("QuickJSRuntime", () => {
  let quickJS: QuickJSWASMModule;
  beforeAll(async () => {
    quickJS = await getQuickJS();
  });

  const createRuntime = () => createQuickJSRuntime(quickJS);

  generateModuleRuntimeTests(createRuntime);
});
