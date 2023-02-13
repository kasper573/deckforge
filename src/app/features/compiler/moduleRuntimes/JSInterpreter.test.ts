import { generateModuleRuntimeTests } from "./tests";
import { JSInterpreterModuleRuntime } from "./JSInterpreter";

describe("JSInterpreter", () => {
  generateModuleRuntimeTests(() => new JSInterpreterModuleRuntime());
});
