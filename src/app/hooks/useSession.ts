import type { Session } from "../../api/trpc";

export function useSession(): { data?: Session } {
  return {};
}

export function useAuthControls() {
  function signIn() {}
  function signOut() {}
  return { signIn, signOut };
}
