import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import { memo, useEffect, useMemo, useReducer, useState } from "react";
import Yard from "@mui/icons-material/Yard";
import { styled } from "@mui/material/styles";
import { useSelector } from "../store";
import { selectors } from "../selectors";
import { Panel } from "../components/Panel";
import type { FallbackProps } from "../../../ErrorBoundary";
import { PanelEmptyState } from "../components/PanelEmptyState";
import { PanelControls } from "../components/PanelControls";
import { compileGame } from "../../compiler/compileGame";
import { Reload } from "../../../components/icons";
import type { RuntimeGenerics } from "../../compiler/types";
import { ErrorBoundary } from "../../../ErrorBoundary";
import { useModal } from "../../../../lib/useModal";
import { PromptDialog } from "../../../dialogs/PromptDialog";
import { useActions } from "../../../../lib/useActions";
import { editorActions } from "../actions";
import type { MachineMiddleware } from "../../../../lib/machine/MachineAction";
import type { MachineContext } from "../../../../lib/machine/MachineContext";
import { PixiGameRenderer } from "../../runtimes/versus/pixi/PixiRenderer";
import type { PanelProps } from "./definition";

export const RuntimePanel = memo(function RuntimePanel(props: PanelProps) {
  const [manualResetCount, resetRuntime] = useReducer((c) => c + 1, 0);
  const gameDefinition = useSelector(selectors.gameDefinition);
  const runtimeDefinition = useSelector(selectors.runtimeDefinition);
  const { log } = useActions(editorActions);
  const [seed, setSeed] = useState("");
  const prompt = useModal(PromptDialog);

  const compiled = useMemo(
    () => {
      if (gameDefinition && runtimeDefinition) {
        return compileGame<RuntimeGenerics>(runtimeDefinition, gameDefinition, {
          seed,
          middlewares: (defaults) => [
            createEventLoggerMiddleware(log),
            createFailSafeMiddleware(log),
            ...defaults,
          ],
        });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [gameDefinition, runtimeDefinition, manualResetCount, seed, log]
  );

  useEffect(() => {
    if (compiled?.error) {
      log(["Compiler error", compiled.error]);
    }
  }, [compiled?.error, log]);
  function onRenderError(error: unknown) {
    log(["Runtime render error", error]);
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
    }
  }

  return (
    <Panel
      toolbarControls={
        <PanelControls>
          <Tooltip title="Customize seed">
            <IconButton
              disabled={!!compiled?.error}
              size="small"
              onClick={tryEditSeed}
            >
              <Yard />
            </IconButton>
          </Tooltip>
          <Tooltip title="Reset runtime">
            <IconButton
              disabled={!!compiled?.error}
              size="small"
              onClick={resetRuntime}
            >
              <Reload />
            </IconButton>
          </Tooltip>
        </PanelControls>
      }
      {...props}
    >
      {compiled &&
        (compiled?.runtime ? (
          <ErrorBoundary
            fallback={RuntimeErrorFallback}
            onError={onRenderError}
          >
            <DockedGameRenderer runtime={compiled.runtime} />
          </ErrorBoundary>
        ) : (
          <PanelEmptyState>
            <Typography variant="h5">Compiler error</Typography>
            <Typography sx={{ my: 1 }}>{`${compiled.error}`}</Typography>
          </PanelEmptyState>
        ))}
    </Panel>
  );
});

const DockedGameRenderer = styled(PixiGameRenderer)`
  width: 100%;
  height: 100%;
  background: ${({ theme }) => theme.palette.secondary.dark};
`;

function createEventLoggerMiddleware(
  log: (args: unknown[]) => void
): MachineMiddleware<MachineContext> {
  return (state, action, next) => {
    log(["Event: ", action.name, "(", action.payload, ")"]);
    next();
  };
}

function createFailSafeMiddleware(
  log: (args: unknown[]) => void
): MachineMiddleware<MachineContext> {
  return (state, action, next) => {
    try {
      next();
    } catch (error) {
      log(["Error during event", action.name, "(", action.payload, ")", error]);
    }
  };
}

function RuntimeErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <PanelEmptyState>
      <Typography variant="h5">Runtime error</Typography>
      <Typography sx={{ my: 1 }}>{error.message}</Typography>
      <Button onClick={resetErrorBoundary}>Retry</Button>
    </PanelEmptyState>
  );
}
