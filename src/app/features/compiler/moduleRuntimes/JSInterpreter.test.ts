import { generateModuleRuntimeTests } from "./testUtils";
import { JSInterpreterModuleRuntime } from "./JSInterpreter";

describe("JSInterpreter", () => {
  generateModuleRuntimeTests(() => new JSInterpreterModuleRuntime());
});
