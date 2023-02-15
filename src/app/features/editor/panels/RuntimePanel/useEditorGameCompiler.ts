import { useMemo, useReducer } from "react";
import { useDebounce } from "use-debounce";
import type { MachineMiddleware } from "../../../../../lib/machine/MachineAction";
import type { MachineContext } from "../../../../../lib/machine/MachineContext";
import type { LogContent } from "../../types";
import { logIdentifier } from "../../types";
import { useSelector } from "../../store";
import { selectors } from "../../selectors";
import { useReaction } from "../../../../../lib/useReaction";
import { useGameCompiler } from "../../../compiler/useGameCompiler";
import { colors } from "./colors";

export function useEditorGameCompiler(
  seed: string,
  log: (args: LogContent[]) => void
) {
  const [resetCount, increaseResetCount] = useReducer((c) => c + 1, 0);
  const [definitions, { isPending }] = useDebouncedDefinitions();
  const isCompiling = isPending();
  const options = useMemo(
    () => ({
      seed,
      middlewares: <T>(defaults: T[]) => [
        createEventLoggerReducer(log),
        createFailSafeReducer(log),
        ...defaults,
      ],
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [seed, log, resetCount]
  );

  const compiled = useGameCompiler(...definitions, options);

  useReaction(() => {
    if (compiled.isErr()) {
      log([
        logIdentifier("[Compiler Error]", { color: colors.error }),
        ...compiled.error,
      ]);
    } else {
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
  const runtime = useSelector(selectors.runtimeDefinition);
  const game = useSelector(selectors.gameDefinition);
  const defs = useMemo(() => [runtime, game] as const, [runtime, game]);
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
