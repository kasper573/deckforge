import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import type { Step } from "react-joyride";
import { Link } from "../../../../components/Link";
import { router } from "../../../../router";
import { createZodStorage } from "../../../../../lib/zod-extensions/zodStorage";
import { useModal } from "../../../../../lib/useModal";
import { Toast } from "../../../../components/Toast";
import { ConfirmDialog } from "../../../../dialogs/ConfirmDialog";
import type { PanelDefinition } from "../../panels/definition";
import { panelDefinitionList } from "../../panels/definition";
import { defined } from "../../../../../lib/ts-extensions/defined";
import { Joyride } from "../../../../components/Joyride";

export function EditorIntro({ isLocalInstance }: { isLocalInstance: boolean }) {
  const showToast = useModal(Toast);
  const confirm = useModal(ConfirmDialog);
  const [isTourEnabled, setIsTourEnabled] = useState(false);
  const tourResolverRef = useRef(() => {});

  const latest = useRef({ isLocalInstance });
  latest.current.isLocalInstance = isLocalInstance;

  useEffect(() => {
    (async () => {
      if (!hasSeenIntroStorage.load()) {
        const shouldTakeTour = await confirm({
          title: "Welcome to the Editor",
          content: (
            <>
              <p>
                This garbage editor was coded in a month as a proof of concept
                and is not easy to use. Unless you are a programmer and
                intimately familiar with event driven programming and state
                machines this editor will basically be useless to you :).
              </p>
              <p>
                However, {`I've`} made a tour that will try to explain how the
                editor works. <br />
                Good luck!
              </p>
            </>
          ),
          confirmLabel: "Take the tour",
          cancelLabel: "No thanks, I've got this",
        });

        hasSeenIntroStorage.save(true);

        if (shouldTakeTour) {
          await takeTour();
        }
      }

      if (latest.current.isLocalInstance) {
        showToast({
          variant: "info",
          duration: 12000,
          content: (
            <>
              You are not signed in and the game will only be saved on your
              device. <Link to={router.user().login()}>Sign in</Link> to save
              your game to the cloud and enable publishing games.
            </>
          ),
        });
      }
    })();
  }, [confirm, showToast]);

  async function takeTour() {
    return new Promise<void>((resolve) => {
      tourResolverRef.current = resolve;
      setIsTourEnabled(true);
    });
  }

  return (
    <Joyride
      run={isTourEnabled}
      steps={tourSteps}
      continuous
      disableCloseOnEsc
      disableOverlayClose
      callback={({ action }) => {
        if (action === "close") {
          tourResolverRef.current();
          setIsTourEnabled(false);
        }
      }}
    />
  );
}

const tourSteps = defined(panelDefinitionList.map(tourStepFromPanel));

function tourStepFromPanel(def: PanelDefinition): Step | undefined {
  if (!def.tour) {
    return;
  }
  return {
    content: def.tour.content,
    target: `.${def.tour.className}`,
  };
}

const hasSeenIntroStorage = createZodStorage(
  z.boolean().optional(),
  "editor-has-seen-intro"
);

// Garbage polyfill solution for react-joyride https://github.com/gilbarbara/react-joyride/issues/772
window.global = window;
