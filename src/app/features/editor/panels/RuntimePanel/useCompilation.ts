import { useMemo, useReducer } from "react";
import { useDebounce } from "use-debounce";
import type { MachineMiddleware } from "../../../../../lib/machine/MachineAction";
import type { MachineContext } from "../../../../../lib/machine/MachineContext";
import type { LogContent } from "../../types";
import { logIdentifier } from "../../types";
import { useSelector } from "../../store";
import { selectors } from "../../selectors";
import { compileGame } from "../../../compiler/compileGame";
import { useReaction } from "../../../../../lib/useReaction";
import { colors } from "./colors";

export function useCompilation(
  seed: string,
  log: (args: LogContent[]) => void
) {
  const [resetCount, increaseResetCount] = useReducer((c) => c + 1, 0);
  const [definitions, { isPending }] = useDebouncedDefinitions();
  const isCompiling = isPending();
  const compiled = useMemo(() => {
    const [game, runtime] = definitions;
    if (game && runtime) {
      return compileGame(runtime, game, {
        seed,
        middlewares: (defaults) => [
          createEventLoggerReducer(log),
          createFailSafeReducer(log),
          ...defaults,
        ],
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [definitions, resetCount, seed, log]);

  useReaction(() => {
    if (compiled?.errors) {
      log([
        logIdentifier("[Compiler Error]", { color: colors.error }),
        ...compiled.errors,
      ]);
    } else if (compiled?.runtime) {
      log(["Game compiled successfully"]);
    }
  }, [compiled]);

  function forceRecompile() {
    log(["Runtime was reset manually"]);
    increaseResetCount();
  }

  return [compiled, forceRecompile, isCompiling] as const;
}

function useDebouncedDefinitions() {
  const game = useSelector(selectors.gameDefinition);
  const runtime = useSelector(selectors.runtimeDefinition);
  const defs = useMemo(() => [game, runtime] as const, [game, runtime]);
  return useDebounce(defs, 1500);
}

function createEventLoggerReducer(
  log: (args: unknown[]) => void
): MachineMiddleware<MachineContext> {
  return (state, action, next) => {
    log([
      logIdentifier("[Event]", { color: colors.info }),
      action.name,
      "(",
      logIdentifier(action.payload, { name: "input" }),
      ")",
    ]);
    next();
  };
}

function createFailSafeReducer(
  log: (args: unknown[]) => void
): MachineMiddleware<MachineContext> {
  return (state, action, next) => {
    try {
      next();
    } catch (error) {
      log([logIdentifier("[Runtime Error]", { color: colors.error }), error]);
    }
  };
}
