import { createPath } from "history";
import type { History } from "history";
import { useStore } from "zustand";
import { useHistory } from "react-router";
import { authStore, isAuthenticated } from "../../auth/store";
import { router } from "../../../router";

export function useOfflineGameServiceState() {
  return shouldUseOfflineGameService(useHistory(), useStore(authStore));
}

export const shouldUseOfflineGameService = (
  history: History,
  authState = authStore.getState()
) => isOnEditorPage(history) && !isAuthenticated(authState);

const isOnEditorPage = (history: History) =>
  createPath(history.location).startsWith(router.editor().$);
