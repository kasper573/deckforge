import { getQuickJS } from "quickjs-emscripten";
import { compileGame } from "../compiler/compileGame";
import { createQuickJSCompiler } from "../compiler/moduleRuntimes/QuickJS/QuickJSCompiler";
import type { GameRuntime, RuntimeGenerics } from "../compiler/types";
import type { GameType } from "./GameType";

export async function testGameType<G extends RuntimeGenerics>(
  gameType: GameType<G>,
  test: (runtime: GameRuntime<G>) => void
) {
  const quickJS = await getQuickJS();
  const gameDefinition = await gameType.defaultGameDefinition();
  const result = compileGame(gameType.runtimeDefinition, gameDefinition, {
    seed: "test",
    moduleCompiler: createQuickJSCompiler({
      createRuntime: () => quickJS.newRuntime(),
    }),
  });

  expect(result).toEqual(expect.objectContaining({ value: expect.anything() }));
  if (!result.isOk()) {
    return;
  }

  let testError: unknown;
  try {
    test(result.value.runtime);
  } catch (error) {
    testError = error;
  }

  let disposeError: unknown;
  try {
    result.value.dispose();
  } catch (error) {
    disposeError = error;
  }

  if (testError) {
    throw testError;
  }
  if (disposeError) {
    throw disposeError;
  }
}
