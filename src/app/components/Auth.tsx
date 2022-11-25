import type { ReactNode } from "react";
import type { UserRole } from "@prisma/client";
import { getAccessLevel } from "../../api/services/auth/getAccessLevel";
import { useSession } from "../hooks/useSession";

type AuthPropsBase = {
  children: ReactNode | (() => ReactNode);
  fallback?: ReactNode;
};

export type AuthProps =
  | (AuthPropsBase & { exact: UserRole })
  | (AuthPropsBase & { atLeast: UserRole })
  | AuthPropsBase;

/**
 * Renders children only when the user has the required access level
 */
export function Auth({ children, fallback, ...props }: AuthProps) {
  const { data: session } = useSession();
  const accessLevel = getAccessLevel(session?.user?.role ?? "Guest");

  let allowAccess = false;
  if ("exact" in props) {
    allowAccess = accessLevel === getAccessLevel(props.exact);
  } else if ("atLeast" in props) {
    allowAccess = accessLevel >= getAccessLevel(props.atLeast);
  } else {
    allowAccess = accessLevel > getAccessLevel("Guest");
  }

  const childrenFn = typeof children === "function" ? children : () => children;
  return <>{allowAccess ? childrenFn() : fallback}</>;
}
