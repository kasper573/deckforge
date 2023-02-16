import { useMemo, useReducer } from "react";
import { useDebounce } from "use-debounce";
import { cloneDeep } from "lodash";
import type { LogContent } from "../../types";
import { logIdentifier } from "../../types";
import { useSelector } from "../../store";
import { selectors } from "../../selectors";
import { useReaction } from "../../../../../lib/useReaction";
import { useGameCompiler } from "../../../compiler/useGameCompiler";
import type { CompileGameOptions } from "../../../compiler/compileGame";
import type { ModuleOutput } from "../../../compiler/moduleRuntimes/types";
import { colors } from "./colors";

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
        event: (e, m) => enhanceModule("Event", e.name, m, log),
        reducer: (r, m) => enhanceModule("Reducer", r.name, m, log),
        card: ([c, d], m) =>
          enhanceModule("Card", `${d.name} > ${c.name}`, m, log),
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
      log([
        logIdentifier("[Compiler Error]", { color: colors.error }),
        ...error,
      ]);
    }
  }, [error]);

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

function enhanceModule<T extends ModuleOutput>(
  moduleType: string,
  moduleName: string,
  mod: T,
  log: (args: unknown[]) => void
): T {
  if (typeof mod === "function") {
    return ((state, payload) => {
      log([
        logIdentifier(`[${moduleType}]`),
        moduleName,
        "(",
        logIdentifier(cloneDeep(state), { name: "state" }),
        ...(payload !== undefined
          ? [",", logIdentifier(payload, { name: "input" })]
          : []),
        ")",
      ]);

      let res;
      try {
        res = mod(state, payload);
      } catch (error) {
        log([logIdentifier("[Runtime Error]", { color: colors.error }), error]);
        return;
      }

      return res;
    }) as T;
  }

  if (typeof mod === "object") {
    return Object.fromEntries(
      Object.entries(mod).map(([key, value]) => [
        key,
        enhanceModule(moduleType, `${moduleName}_${key}`, value ?? noop, log),
      ])
    ) as T;
  }

  throw new Error("Unexpected module type");
}

const noop = () => {};
