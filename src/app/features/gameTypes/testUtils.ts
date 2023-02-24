import { getQuickJS } from "quickjs-emscripten";
import type { CompiledGame } from "../compiler/compileGame";
import { compileGame } from "../compiler/compileGame";
import { createQuickJSCompiler } from "../compiler/moduleRuntimes/QuickJS/QuickJSCompiler";
import type { RuntimeGenerics } from "../compiler/types";
import type { GameType } from "./GameType";

export async function testGameType<G extends RuntimeGenerics>(
  gameType: GameType<G>,
  test: (game: CompiledGame<G>) => void
) {
  const quickJS = await getQuickJS();
  const gameDefinition = await gameType.defaultGameDefinition();
  const result = compileGame(gameType.runtimeDefinition, gameDefinition, {
    moduleCompiler: createQuickJSCompiler({
      createRuntime: () => quickJS.newRuntime(),
    }),
  });

  expect(result).toEqual(expect.objectContaining({ value: expect.anything() }));

  if (result.isOk()) {
    await test(result.value);
    result.value.dispose();
  }
}
