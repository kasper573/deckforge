import { useEffect, useMemo, useState } from "react";
import type { Result } from "neverthrow";
import { err, ok } from "neverthrow";
import { useAsyncMemo } from "../../hooks/useAsyncMemo";
import type { GameDefinition } from "../../../api/services/game/types";
import { moduleCompilerInfo } from "./moduleRuntimes";
import type { CompileGameOptions } from "./compileGame";
import { compileGame } from "./compileGame";
import type { GameRuntime, RuntimeDefinition, RuntimeGenerics } from "./types";

export function useGameCompiler<G extends RuntimeGenerics>(
  runtimeDefinition?: RuntimeDefinition<G>,
  gameDefinition?: GameDefinition,
  options?: Omit<CompileGameOptions<G>, "moduleCompiler">
): Result<
  { status: "ready"; runtime: GameRuntime<G> } | { status: "pending" },
  unknown[]
> {
  const [disposeError, setDisposeError] = useState<unknown>();

  const createModuleCompiler = useAsyncMemo(
    moduleCompilerInfo.loadCompilerFactory
  );

  const compiled = useMemo(() => {
    if (gameDefinition && runtimeDefinition && createModuleCompiler) {
      return compileGame(runtimeDefinition, gameDefinition, {
        moduleCompiler: createModuleCompiler(),
        ...options,
      });
    }
  }, [runtimeDefinition, gameDefinition, createModuleCompiler, options]);

  useEffect(
    () => () => {
      try {
        setDisposeError(undefined);
        if (compiled?.isOk()) {
          compiled.value.dispose();
        }
      } catch (error) {
        setDisposeError(error);
      }
    },
    [compiled]
  );

  if (!compiled) {
    return ok({ status: "pending" });
  }

  if (disposeError) {
    return err([disposeError]);
  }

  return compiled.map((c) => ({ status: "ready", runtime: c.runtime }));
}
