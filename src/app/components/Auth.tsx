import type { ReactNode } from "react";
import type { UserRole } from "@prisma/client";
import { useAuth0 } from "../../shared/auth0/useAuth0";
import { getAccessLevel } from "../../api/services/auth/utils";

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
  const { isAuthenticated } = useAuth0();
  const accessLevel = getAccessLevel(isAuthenticated ? "User" : "Guest");

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
