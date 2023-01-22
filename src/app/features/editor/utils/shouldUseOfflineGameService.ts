import { authStore, isAuthenticated } from "../../auth/store";

export const shouldUseOfflineGameService = (authState = authStore.getState()) =>
  !isAuthenticated(authState);
