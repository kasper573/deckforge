import { useMemo } from "react";
import { useAsyncMemo } from "../../hooks/useAsyncMemo";
import { useDisposable } from "../../hooks/useDisposable";
import type { GameDefinition } from "../../../api/services/game/types";
import { moduleCompilerInfo } from "./moduleRuntimes";
import type { CompileGameOptions } from "./compileGame";
import { compileGame } from "./compileGame";
import type { RuntimeDefinition, RuntimeGenerics } from "./types";

export function useGameCompiler<G extends RuntimeGenerics>(
  runtimeDefinition?: RuntimeDefinition<G>,
  gameDefinition?: GameDefinition,
  options?: Omit<CompileGameOptions<G>, "moduleCompiler">
) {
  const createModuleCompiler = useAsyncMemo(moduleCompilerInfo.loadCompilerFactory);
  const compiled = useMemo(() => {
    if (gameDefinition && runtimeDefinition && createModuleCompiler) {
      return compileGame(runtimeDefinition, gameDefinition, {
        moduleCompiler: createModuleCompiler(),
        ...options,
      });
    }
  }, [runtimeDefinition, gameDefinition, createModuleCompiler, options]);

  useDisposable(compiled);

  return compiled;
}
