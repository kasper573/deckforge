import { createStore, useStore } from "zustand";
import { persist } from "zustand/middleware";
import { useHistory } from "react-router";
import type { History } from "history";
import { loginRedirect, logoutRedirect } from "../../router";
import { trpc } from "../../trpc";
import type { JWTUser, LoginPayload } from "../../../api/services/user/types";

const localStorageKey = "auth" as const;

export interface AuthState {
  token?: string;
  user?: JWTUser;
}

export const authStore = createStore<AuthState>()(
  persist((set) => ({}), { name: localStorageKey })
);

export function useAuth() {
  const state = useStore(authStore);
  const history = useHistory();
  const {
    mutateAsync: loginMutateAsync,
    mutate: loginMutate,
    ...loginMutationProps
  } = trpc.user.login.useMutation();

  async function enhancedLogin(payload: LoginPayload) {
    try {
      authStore.setState(await loginMutateAsync(payload));
      if (isAuthenticated(authStore.getState())) {
        history.push(loginRedirect.$);
      }
    } catch (e) {}
  }

  const enhancedLoginMutation = {
    ...loginMutationProps,
    mutateAsync: enhancedLogin,
  };

  return {
    ...state,
    isAuthenticated: isAuthenticated(state),
    login: enhancedLoginMutation,
    logout: () => logout(history),
  };
}

export const isAuthenticated = (state: AuthState = authStore.getState()) =>
  !!(state.token && state.user);

function logout(history: History) {
  resetAuthToken();
  localStorage.removeItem(localStorageKey);
  history.push(logoutRedirect.$);
}

export function getAuthToken() {
  return authStore.getState().token;
}

export function resetAuthToken() {
  authStore.setState({ token: undefined, user: undefined });
}

export function setupAuthBehavior<State>({
  history,
  onTokenChanged,
  interval = 1000,
}: {
  history: History;
  onTokenChanged?: () => void;
  interval?: number;
}) {
  const getToken = () => authStore.getState().token;

  // Logout when token expires
  const intervalId = setInterval(() => {
    const token = getToken();
    if (token && isTokenExpired(token)) {
      logout(history);
    }
  }, interval);

  let prevToken = getToken();
  const unsubscribe = authStore.subscribe(() => {
    const newToken = getToken();
    if (newToken !== prevToken) {
      prevToken = newToken;
      onTokenChanged?.();
    }
  });

  return () => {
    clearInterval(intervalId);
    unsubscribe();
  };
}

function isTokenExpired(token: string) {
  const expiry = JSON.parse(atob(token.split(".")[1])).exp;
  return Math.floor(new Date().getTime() / 1000) >= expiry;
}
