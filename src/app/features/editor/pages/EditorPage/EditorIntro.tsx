import { useCallback, useEffect, useRef, useState } from "react";
import { z } from "zod";
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

export function EditorIntro({ isLocalInstance }: { isLocalInstance: boolean }) {
  const tourResolverRef = useRef(() => {});
  const showToast = useModal(Toast);
  const confirm = useModal(ConfirmDialog);
  const [tourState, setTourState] = useState<TourState>({
    step: 0,
    active: false,
  });

  const latest = useRef({ isLocalInstance });
  latest.current.isLocalInstance = isLocalInstance;

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

      if (latest.current.isLocalInstance) {
        showToast(modals.localInstanceInfo);
      }
    })();
  }, [showIntro, showToast]);

  return (
    <Tour
      steps={tourSteps}
      state={tourState}
      onChange={handleTourStateChange}
    />
  );
}

const tourSteps = defined(panelDefinitionList.map((panel) => panel.tour));

const modals = {
  intro: {
    title: "Welcome to the Editor",
    content: (
      <>
        <p>
          This garbage editor was coded in a month as a proof of concept and is
          not easy to use. Unless you are a programmer and intimately familiar
          with event driven programming and state machines this editor will
          basically be useless to you :).
        </p>
        <p>
          However, {`I've`} made a tour that will try to explain how the editor
          works. <br />
          Good luck!
        </p>
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
