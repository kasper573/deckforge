import { useMemo, useReducer } from "react";
import { useDebounce } from "use-debounce";
import { useSelector } from "../../store";
import { selectors } from "../../selectors";
import { useReaction } from "../../../../../lib/useReaction";
import { useGameCompiler } from "../../../compiler/useGameCompiler";
import type { CompileGameOptions } from "../../../compiler/compileGame";
import type { LogContent } from "../../../log/types";
import type { MachineMiddleware } from "../../../../../lib/machine/MachineAction";
import type { MachineContext } from "../../../../../lib/machine/MachineContext";
import { logIdentifiers } from "./logIdentifiers";

export function useEditorGameCompiler(
  seed: string,
  log: (args: LogContent[]) => void
) {
  const [resetCount, increaseResetCount] = useReducer((c) => c + 1, 0);
  const [definitions, { isPending }] = useDebouncedDefinitions();
  const isCompiling = isPending();
  const options = useMemo(
    (): Partial<CompileGameOptions> => ({
      seed,
      log: (...args: unknown[]) => log(args),
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
  const runtime =
    compiled.isOk() && compiled.value.status === "ready"
      ? compiled.value.runtime
      : undefined;

  const compilerErrors = compiled.isErr() ? compiled.error : undefined;

  useReaction(() => {
    if (runtime) {
      log(["Game compiled successfully"]);
    }
  }, [runtime]);

  useReaction(() => {
    if (compilerErrors) {
      for (const error of compilerErrors) {
        log([logIdentifiers.errors.compiler, error]);
      }
    }
  }, [compilerErrors]);

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
      logIdentifiers.event,
      action.name,
      "(",
      logIdentifiers.variable("state", state),
      ",",
      logIdentifiers.variable("input", action.payload),
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
      log([logIdentifiers.errors.runtime, error]);
    }
  };
}
