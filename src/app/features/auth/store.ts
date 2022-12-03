import { createStore, useStore } from "zustand";
import { persist } from "zustand/middleware";
import { useHistory } from "react-router";
import type { History } from "history";
import { loginRedirect, logoutRedirect } from "../../router";
import { trpc } from "../../trpc";
import type { JWTUser, LoginPayload } from "../../../api/services/user/types";

const store = createStore<{
  token?: string;
  user?: JWTUser;
  isAuthenticated: boolean;
  update: (changes: { token?: string; user?: JWTUser }) => void;
}>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      update: (changes) =>
        set((state) => {
          const newState = { ...state, ...changes };
          newState.isAuthenticated = !!newState.token;
          return newState;
        }),
    }),
    { name: "auth" }
  )
);

export function useAuth() {
  const { token, user, isAuthenticated } = useStore(store);
  const history = useHistory();
  const {
    mutateAsync: loginMutateAsync,
    mutate: loginMutate,
    ...loginMutationProps
  } = trpc.user.login.useMutation();

  async function enhancedLogin(
    payload: LoginPayload,
    { destination = loginRedirect }: { destination?: typeof loginRedirect } = {}
  ) {
    try {
      const result = await loginMutateAsync(payload);
      store.getState().update(result);
      if (store.getState().isAuthenticated) {
        history.push(destination.$);
      }
    } catch (e) {}
  }

  const enhancedLoginMutation = {
    ...loginMutationProps,
    mutateAsync: enhancedLogin,
  };

  return {
    token,
    user,
    isAuthenticated,
    login: enhancedLoginMutation,
    logout: () => logout(history),
  };
}

function logout(history: History) {
  const state = store.getState();
  state.update({ token: undefined, user: undefined });
  localStorage.removeItem("auth");
  history.push(logoutRedirect.$);
}

export function getAuthToken() {
  return store.getState().token;
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
  const getToken = () => store.getState().token;

  // Logout when token expires
  const intervalId = setInterval(() => {
    const token = getToken();
    if (token && isTokenExpired(token)) {
      logout(history);
    }
  }, interval);

  let prevToken = getToken();
  const unsubscribe = store.subscribe(() => {
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
