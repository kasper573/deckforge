import { useCallback, useEffect, useRef, useState } from "react";
import { z } from "zod";
import GlobalStyles from "@mui/material/GlobalStyles";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import { createZodStorage } from "../../../../../lib/zod-extensions/zodStorage";
import { useModal } from "../../../../../lib/useModal";
import { Toast } from "../../../../components/Toast";
import { ConfirmDialog } from "../../../../dialogs/ConfirmDialog";
import { panelDefinitionList } from "../../panels/definition";
import type { TourState } from "../../../../components/Tour";
import { Tour } from "../../../../components/Tour";
import { Link } from "../../../../components/Link";
import { router } from "../../../../router";
import { useOfflineGameServiceState } from "../../utils/shouldUseOfflineGameService";
import { useReaction } from "../../../../../lib/useReaction";
import type { PanelId } from "../../types";
import { showEditorHelp } from "./events";

export function EditorIntro() {
  const tourResolverRef = useRef(() => {});
  const showToast = useModal(Toast);
  const confirm = useModal(ConfirmDialog);
  const isLocalDeviceData = useOfflineGameServiceState();
  const [tourState, setTourState] = useState<TourState>({
    step: 0,
    active: false,
  });

  const takeTour = useCallback(
    (startAt?: PanelId) =>
      new Promise<void>((resolve) => {
        tourResolverRef.current = resolve;
        const step = startAt !== undefined ? tourIndex(startAt) : 0;
        setTourState((state) => ({ ...state, step, active: true }));
      }),
    []
  );

  const showHelp = useCallback(
    async (skipToPanel?: PanelId) => {
      if (skipToPanel ? true : await confirm(modals.intro)) {
        await takeTour(skipToPanel);
      }
    },
    [confirm, takeTour]
  );

  const handleTourStateChange = useCallback((updated: TourState) => {
    setTourState((current) => {
      if (current.active && !updated.active) {
        tourResolverRef.current();
      }
      return updated;
    });
  }, []);

  useEffect(() => showEditorHelp.subscribe(showHelp), [showHelp]);

  useReaction(async () => {
    if (!hasSeenIntroStorage.load()) {
      await showHelp();
    }
    hasSeenIntroStorage.save(true);

    if (isLocalDeviceData) {
      showToast(modals.localInstanceInfo);
    }
  }, []);

  return (
    <>
      {tourState.active && touchScrollDisabler}
      <Tour
        steps={tourSteps}
        state={tourState}
        onChange={handleTourStateChange}
      />
    </>
  );
}

const touchScrollDisabler = (
  <GlobalStyles
    styles={{
      body: {
        touchAction: "none",
      },
    }}
  />
);

const tourSteps = panelDefinitionList.map((panel) => panel.tour);
const tourIndex = (id: PanelId) =>
  panelDefinitionList.findIndex((p) => p.id === id);

const modals = {
  intro: {
    title: "Welcome to Deck Forge",
    content: (
      <>
        <Typography>
          An opinionated and simplified editor and engine for card games. You
          decide the game mechanics. Rendering is handled by Deck Forge.
        </Typography>
        <Divider sx={{ my: 2 }} />
        <Typography paragraph>
          Deck Forge is a proof of concept and is not particularly intuitive.
          Unless you are a programmer and intimately familiar with event driven
          programming and state machines this editor will basically be useless
          to you :).
        </Typography>
        <Typography>
          However, {`I've`} made a tour that will try to explain how the editor
          works. <br />
          Good luck!
        </Typography>
      </>
    ),
    confirmLabel: "Take the tour",
    cancelLabel: "No thanks, I've got this",
  },
  localInstanceInfo: {
    variant: "info" as const,
    duration: 12000,
    content: (
      <>
        You are not signed in and the game will only be available on your
        device. <Link to={router.user().login()}>Sign in</Link> to save your
        game to the cloud and enable publishing games.
      </>
    ),
  },
};

const hasSeenIntroStorage = createZodStorage(
  z.boolean(),
  "editor-has-seen-intro",
  false
);
