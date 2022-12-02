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
  const { token, user, isAuthenticated, update } = useStore(store);
  const history = useHistory();
  const loginMutation = trpc.user.login.useMutation();

  async function login(
    payload: LoginPayload,
    { destination = loginRedirect }: { destination?: typeof loginRedirect } = {}
  ) {
    try {
      const result = await loginMutation.mutateAsync(payload);
      if (result.success) {
        update(result);
        history.push(destination.$);
      }
      return result;
    } catch (e) {
      return {
        success: false,
        message:
          e instanceof Error
            ? e.message
            : "Something went wrong while signing in",
      };
    }
  }

  return {
    token,
    user,
    isAuthenticated,
    login,
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
