import type { ModuleCompilerInfo } from "../types";

export const jsInterpreterCompilerInfo: ModuleCompilerInfo = {
  name: "JSInterpreter",
  tsCompilerOptions: { lib: ["ES5"] },
  loadCompilerFactory: async () => {
    const { JSInterpreterCompiler } = await import("./JSInterpreter");
    return () => new JSInterpreterCompiler();
  },
};
