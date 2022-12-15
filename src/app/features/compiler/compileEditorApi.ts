import type { Game } from "../../../api/services/game/types";
import type { CodeEditorTypedef } from "../../components/CodeEditor";

export interface EditorApi {
  card: CodeEditorTypedef;
  action: CodeEditorTypedef;
  reaction: CodeEditorTypedef;
}

export function compileEditorApi(game: Game): EditorApi {
  return {
    card: "",
    action: "",
    reaction: "",
  };
}
