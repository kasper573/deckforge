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

  function takeTour() {
    console.log("start tour");
  }
}

const hasSeenIntroStorage = createZodStorage(
  z.boolean().optional(),
  "editor-has-seen-intro"
);
