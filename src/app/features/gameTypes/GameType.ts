import type { ComponentType, HTMLAttributes } from "react";
import type { RuntimeDefinition } from "../compiler/types";
import type {
  GameDefinition,
  GameTypeId,
} from "../../../api/services/game/types";
import type { RuntimeGenerics } from "../compiler/types";
import type { GameRuntime } from "../compiler/compileGame";

export interface GameType<G extends RuntimeGenerics = RuntimeGenerics> {
  id: GameTypeId;
  name: string;
  defaultGameDefinition: GameDefinition;
  runtimeDefinition: RuntimeDefinition<G>;
  renderer: GameRenderer<G>;
}

export type GameRenderer<G extends RuntimeGenerics> = ComponentType<
  { runtime: GameRuntime<G> } & Pick<
    HTMLAttributes<HTMLElement>,
    "className" | "style"
  >
>;
