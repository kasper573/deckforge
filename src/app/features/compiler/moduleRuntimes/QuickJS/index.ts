import type { InterruptHandler } from "quickjs-emscripten";
import type { ModuleCompilerInfo } from "../types";
import { env } from "../../../../env";

export const quickJSCompilerInfo: ModuleCompilerInfo = {
  name: "QuickJS",
  tsCompilerOptions: { lib: ["es2020"] },
  loadCompilerFactory: async () => {
    const [quickJS, { createQuickJSCompiler }] = await Promise.all([
      import("quickjs-emscripten").then(({ getQuickJS }) => getQuickJS()),
      import("./QuickJSCompiler"),
    ]);
    return () =>
      createQuickJSCompiler({
        memoryLeaks: env.moduleCompiler.memoryLeaks,
        createRuntime: () =>
          quickJS.newRuntime({
            memoryLimitBytes: 1024 * 640,
            maxStackSizeBytes: 1024 * 320,
            interruptHandler: createInterruptHandler(),
          }),
      });
  },
};

function createInterruptHandler({
  stallThreshold = 16,
  maxStallTime = 1000,
} = {}): InterruptHandler {
  let lastInterruptTime = Date.now();
  let accumulatedStallTime = 0;
  return () => {
    const now = Date.now();
    const delta = now - lastInterruptTime;
    lastInterruptTime = now;
    if (delta <= stallThreshold) {
      accumulatedStallTime += delta;
    } else {
      accumulatedStallTime = 0;
    }
    return accumulatedStallTime >= maxStallTime;
  };
}
