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
import { defined } from "../../../../../lib/ts-extensions/defined";
import type { TourState } from "../../../../components/Tour";
import { Tour } from "../../../../components/Tour";
import { Link } from "../../../../components/Link";
import { router } from "../../../../router";
import { helpEvent } from "../../components/AppBar/EditorMenu";
import { useStore } from "../../store";
import { isAuthenticated } from "../../../auth/store";

export function EditorIntro() {
  const tourResolverRef = useRef(() => {});
  const showToast = useModal(Toast);
  const confirm = useModal(ConfirmDialog);
  const store = useStore();
  const [tourState, setTourState] = useState<TourState>({
    step: 0,
    active: false,
  });

  const takeTour = useCallback(
    () =>
      new Promise<void>((resolve) => {
        tourResolverRef.current = resolve;
        setTourState((state) => ({ ...state, step: 0, active: true }));
      }),
    []
  );

  const showIntro = useCallback(
    async function showIntro() {
      if (await confirm(modals.intro)) {
        await takeTour();
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

  useEffect(() => helpEvent.subscribe(showIntro), [showIntro]);

  useEffect(() => {
    (async () => {
      if (!hasSeenIntroStorage.load()) {
        await showIntro();
      }
      hasSeenIntroStorage.save(true);

      if (!isAuthenticated()) {
        showToast(modals.localInstanceInfo);
      }
    })();
  }, [showIntro, showToast, store]);

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

const tourSteps = defined(panelDefinitionList.map((panel) => panel.tour));

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
          The engine currently only supports a single game mode: 1v1 turn based
          and mana/health based combat.
        </Typography>
        <Typography>
          However, the system is designed to be extensible, so if I get around
          to implementing new game modes you will be able to pick from a
          supported list of game modes when you create new games.
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
        You are not signed in and the game will only be saved on your device.{" "}
        <Link to={router.user().login()}>Sign in</Link> to save your game to the
        cloud and enable publishing games.
      </>
    ),
  },
};

const hasSeenIntroStorage = createZodStorage(
  z.boolean().optional(),
  "editor-has-seen-intro"
);
