import type { ModuleCompilerInfo } from "./types";
import { quickJSCompilerInfo } from "./QuickJS";

// While deckforge doesn't let the user decide which module compiler to use,
// it's still abstracted enough to allow switching compilers.
// This is the single source of truth for which compiler to use.
export const moduleCompilerInfo: ModuleCompilerInfo = quickJSCompilerInfo;
