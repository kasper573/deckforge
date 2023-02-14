import type { QuickJSContext } from "quickjs-emscripten";
import {
  DEBUG_SYNC,
  getQuickJS,
  newQuickJSWASMModule,
  TestQuickJSWASMModule,
} from "quickjs-emscripten";
import { memoizePromiseFactory } from "quickjs-emscripten/dist/variants";
import { generateModuleRuntimeTests } from "../tests";
import { createQuickJSCompiler } from "./QuickJSCompiler";

function generateQuickJSTests(vmFactory: () => QuickJSContext) {
  generateModuleRuntimeTests(() => createQuickJSCompiler(vmFactory));
}

type TestStrategy = keyof typeof testStrategies;
const testStrategies = {
  debug() {
    const loadDebugModule = memoizePromiseFactory(() =>
      newQuickJSWASMModule(DEBUG_SYNC)
    );
    let quickJS: TestQuickJSWASMModule;
    let vmFactory: () => QuickJSContext;

    beforeEach(async () => {
      quickJS = new TestQuickJSWASMModule(await loadDebugModule());
      vmFactory = () => quickJS.newContext();
    });

    afterEach(() => quickJS.assertNoMemoryAllocated());

    generateQuickJSTests(() => vmFactory());
  },
  release() {
    let vmFactory: () => QuickJSContext;

    beforeEach(async () => {
      const quickJS = await getQuickJS();
      vmFactory = () => quickJS.newContext();
    });

    generateQuickJSTests(() => vmFactory());
  },
};

const strategy: TestStrategy = "release";

describe("QuickJSCompiler", () => testStrategies[strategy]());
