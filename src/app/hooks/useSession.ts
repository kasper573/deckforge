import type { User } from "@auth0/auth0-react";
import { useAuth0 } from "@auth0/auth0-react";
import type { Session } from "../../api/trpc";

export function useSession(): { data?: Session } {
  const { user, isLoading } = useAuth0();

  return {
    data: user ? { user: convertUser(user) } : undefined,
  };
}

function convertUser(user: User): Session["user"] {
  return {
    id: user.email ?? "Unknown",
    name: user.name ?? "Unknown",
    role: "User",
  };
}
