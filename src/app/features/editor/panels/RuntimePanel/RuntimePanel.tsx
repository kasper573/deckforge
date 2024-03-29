import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import { useState } from "react";
import Yard from "@mui/icons-material/Yard";
import useTheme from "@mui/material/styles/useTheme";
import { useSelector } from "../../store";
import { selectors } from "../../selectors";
import { Panel } from "../../components/Panel";
import { ErrorBoundary } from "../../../../ErrorBoundary";
import { PanelEmptyState } from "../../components/PanelEmptyState";
import { PanelControls } from "../../components/PanelControls";
import { Reload } from "../../../../components/icons";
import { useModal } from "../../../../../lib/useModal";
import { PromptDialog } from "../../../../dialogs/PromptDialog";
import { useActions } from "../../../../../lib/useActions";
import { editorActions } from "../../actions";
import { PendingGameRenderer } from "../../../compiler/GameRenderer";
import type { PanelProps } from "../definition";
import { colors } from "../../../log/colors";
import { LogIdentifier } from "../../../log/types";
import { RuntimeErrorFallback } from "./RuntimeErrorFallback";
import { CompilingIndicator } from "./CompilingIndicator";
import { useEditorGameCompiler } from "./useEditorGameCompiler";

export function RuntimePanel(props: PanelProps) {
  const theme = useTheme();
  const { log } = useActions(editorActions);
  const prompt = useModal(PromptDialog);
  const [seed, setSeed] = useState("");
  const gameType = useSelector(selectors.gameType);
  const [compiled, recompile, isCompiling] = useEditorGameCompiler(seed, log);

  function onRenderError(error: unknown) {
    log([
      LogIdentifier.create("[Renderer Error]", { color: colors.error }),
      error,
    ]);
  }

  async function tryEditSeed() {
    const newSeed = await prompt({
      title: "Customize seed",
      label: "Seed",
      helperText:
        "Controls all randomness in the game. Editor feature only. Has no impact on published game.",
      defaultValue: seed,
    });

    if (newSeed) {
      setSeed(newSeed);
      log(["Seed changed to: " + newSeed]);
    }
  }

  return (
    <Panel
      toolbarControls={
        <PanelControls>
          <Tooltip title="Customize seed">
            <IconButton size="small" onClick={tryEditSeed}>
              <Yard />
            </IconButton>
          </Tooltip>
          <Tooltip title="Reset runtime">
            <IconButton size="small" onClick={recompile}>
              <Reload />
            </IconButton>
          </Tooltip>
        </PanelControls>
      }
      {...props}
    >
      {compiled.isOk() && (
        <ErrorBoundary fallback={RuntimeErrorFallback} onError={onRenderError}>
          <PendingGameRenderer
            result={compiled}
            type={gameType}
            style={{
              width: "100%",
              height: "100%",
              background: theme.palette.secondary.dark,
            }}
          />
        </ErrorBoundary>
      )}
      {compiled.isErr() && (
        <PanelEmptyState>
          <Typography variant="h5">Compiler error</Typography>
        </PanelEmptyState>
      )}
      <CompilingIndicator visible={isCompiling} />
    </Panel>
  );
}
