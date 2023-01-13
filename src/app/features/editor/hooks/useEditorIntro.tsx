import { useEffect } from "react";
import { z } from "zod";
import { Link } from "../../../components/Link";
import { router } from "../../../router";
import { createZodStorage } from "../../../../lib/zod-extensions/zodStorage";
import { useModal } from "../../../../lib/useModal";
import { Toast } from "../../../components/Toast";
import { ConfirmDialog } from "../../../dialogs/ConfirmDialog";

export function useEditorIntro(isLocalInstance: () => boolean) {
  const showToast = useModal(Toast);
  const confirm = useModal(ConfirmDialog);

  useEffect(() => {
    (async () => {
      if (!hasSeenIntroStorage.load()) {
        const shouldTakeTour = await confirm({
          title: "Take tour?",
          content: "Content",
          confirmLabel: "Take tour",
          cancelLabel: "No thanks",
        });

        hasSeenIntroStorage.save(true);

        if (shouldTakeTour) {
          startTour();
        }
      }

      if (isLocalInstance()) {
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
  });

  function startTour() {
    console.log("start tour");
  }
}

const hasSeenIntroStorage = createZodStorage(
  z.boolean().optional(),
  "editor-has-seen-intro"
);
