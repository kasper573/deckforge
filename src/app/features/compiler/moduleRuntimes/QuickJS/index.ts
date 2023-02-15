import type { ModuleCompilerInfo } from "../types";

export const quickJSCompilerInfo: ModuleCompilerInfo = {
  name: "QuickJS",
  tsCompilerOptions: { lib: ["es2020"] },
  loadCompilerFactory: async () => {
    const [quickJS, { createQuickJSCompiler }] = await Promise.all([
      import("quickjs-emscripten").then(({ getQuickJS }) => getQuickJS()),
      import("./QuickJSCompiler"),
    ]);
    return () => createQuickJSCompiler(() => quickJS.newRuntime());
  },
};
