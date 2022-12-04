import type { ReactNode } from "react";
import type { UserRole } from "../../../api/services/user/types";
import { roleToAccessLevel } from "../../../api/services/user/types";
import { useAuth } from "./store";

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
  const { user } = useAuth();

  const access = user?.access ?? roleToAccessLevel("Guest");
  let allowAccess = false;
  if ("exact" in props) {
    allowAccess = access === roleToAccessLevel(props.exact);
  } else if ("atLeast" in props) {
    allowAccess = access >= roleToAccessLevel(props.atLeast);
  } else {
    allowAccess = access > roleToAccessLevel("Guest");
  }

  const childrenFn = typeof children === "function" ? children : () => children;
  return <>{allowAccess ? childrenFn() : fallback}</>;
}
