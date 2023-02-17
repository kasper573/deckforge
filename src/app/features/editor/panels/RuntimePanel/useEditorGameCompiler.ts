import { useMemo, useReducer } from "react";
import { useDebounce } from "use-debounce";
import { cloneDeep } from "lodash";
import { useSelector } from "../../store";
import { selectors } from "../../selectors";
import { useReaction } from "../../../../../lib/useReaction";
import { useGameCompiler } from "../../../compiler/useGameCompiler";
import type { CompileGameOptions } from "../../../compiler/compileGame";
import type { ModuleOutput } from "../../../compiler/moduleRuntimes/types";
import { colors } from "../../../log/colors";
import type { LogContent } from "../../../log/types";
import { LogIdentifier } from "../../../log/types";

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
      moduleEnhancers: {
        event: (e, m) => enhanceModule(logIdentifiers.event, e.name, m, log),
        reducer: (r, m) =>
          enhanceModule(logIdentifiers.reducer, r.name, m, log),
        card: ([c, d], m) =>
          enhanceModule(logIdentifiers.card, `${d.name} > ${c.name}`, m, log),
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [seed, log, resetCount]
  );

  const compiled = useGameCompiler(...definitions, options);
  const runtime =
    compiled.isOk() && compiled.value.status === "ready"
      ? compiled.value.runtime
      : undefined;
  const error = compiled.isErr() ? compiled.error : undefined;

  useReaction(() => {
    if (runtime) {
      log(["Game compiled successfully"]);
    }
  }, [runtime]);

  useReaction(() => {
    if (error) {
      log([logIdentifiers.errors.compiler, ...error]);
    }
  }, [error]);

  function forceRecompile() {
    log(["Runtime was reset manually"]);
    increaseResetCount();
  }

  return [compiled, forceRecompile, isCompiling] as const;
}

const logIdentifiers = {
  event: LogIdentifier.create(`[Event]`, { color: "#0c9d5b" }),
  reducer: LogIdentifier.create(`[Reducer]`, { color: "#aa3fd0" }),
  card: LogIdentifier.create(`[Card]`, { color: "#a99326" }),
  errors: {
    runtime: LogIdentifier.create(`[Runtime Error]`, {
      color: colors.error,
    }),
    compiler: LogIdentifier.create(`[Compiler Error]`, {
      color: colors.error,
    }),
  },
};

function useDebouncedDefinitions() {
  const runtime = useSelector(selectors.runtimeDefinition);
  const game = useSelector(selectors.gameDefinition);
  const defs = useMemo(() => [runtime, game] as const, [runtime, game]);
  return useDebounce(defs, 1500);
}

function enhanceModule<T extends ModuleOutput>(
  typeIdentifier: unknown,
  moduleName: string,
  mod: T,
  log: (args: unknown[]) => void
): T {
  if (typeof mod === "function") {
    return ((state, payload) => {
      log([
        typeIdentifier,
        moduleName,
        "(",
        LogIdentifier.create(cloneDeep(state), {
          text: "state",
          highlight: true,
        }),
        ...(payload !== undefined
          ? [
              ",",
              LogIdentifier.create(payload, {
                text: "input",
                highlight: true,
              }),
            ]
          : []),
        ")",
      ]);

      let res;
      try {
        res = mod(state, payload);
      } catch (error) {
        log([logIdentifiers.errors.runtime, error]);
        return;
      }

      return res;
    }) as T;
  }

  if (typeof mod === "object") {
    return Object.fromEntries(
      Object.entries(mod).map(([key, value]) => [
        key,
        enhanceModule(
          typeIdentifier,
          `${moduleName}_${key}`,
          value ?? noop,
          log
        ),
      ])
    ) as T;
  }

  throw new Error("Unexpected module type");
}

const noop = () => {};
