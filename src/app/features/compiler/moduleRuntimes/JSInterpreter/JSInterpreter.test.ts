import { generateModuleRuntimeTests } from "../tests";
import { JSInterpreterCompiler } from "./JSInterpreter";

describe("JSInterpreter", () => {
  generateModuleRuntimeTests(() => new JSInterpreterCompiler());
});
