import type { QuickJSRuntime } from "quickjs-emscripten";
import {
  DEBUG_SYNC,
  getQuickJS,
  newQuickJSWASMModule,
  TestQuickJSWASMModule,
} from "quickjs-emscripten";
import { memoizePromiseFactory } from "quickjs-emscripten/dist/variants";
import { generateModuleRuntimeTests } from "../tests";
import { createQuickJSCompiler } from "./QuickJSCompiler";

function generateQuickJSTests(createRuntime: () => QuickJSRuntime) {
  generateModuleRuntimeTests(() => createQuickJSCompiler(createRuntime));
}

type TestStrategy = keyof typeof testStrategies;
const testStrategies = {
  debug() {
    const loadDebugModule = memoizePromiseFactory(() =>
      newQuickJSWASMModule(DEBUG_SYNC)
    );
    let quickJS: TestQuickJSWASMModule;
    let createRuntime: () => QuickJSRuntime;

    beforeEach(async () => {
      quickJS = new TestQuickJSWASMModule(await loadDebugModule());
      createRuntime = () => quickJS.newRuntime();
    });

    afterEach(() => quickJS.assertNoMemoryAllocated());

    generateQuickJSTests(() => createRuntime());
  },
  release() {
    let createRuntime: () => QuickJSRuntime;

    beforeEach(async () => {
      const quickJS = await getQuickJS();
      createRuntime = () => quickJS.newRuntime();
    });

    generateQuickJSTests(() => createRuntime());
  },
};

const strategy: TestStrategy = "release";

describe("QuickJSCompiler", () => testStrategies[strategy]());
