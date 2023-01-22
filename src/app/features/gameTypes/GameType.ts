import type { ComponentType, HTMLAttributes, ReactNode } from "react";
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
  description: ReactNode;
  defaultGameDefinition: GameDefinition;
  runtimeDefinition: RuntimeDefinition<G>;
  renderer: ComponentType<GameRendererProps<G>>;
}

export type GameRendererProps<G extends RuntimeGenerics> = {
  runtime: GameRuntime<G>;
} & Pick<HTMLAttributes<HTMLElement>, "className" | "style">;
