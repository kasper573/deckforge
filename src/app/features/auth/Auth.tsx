import type { ReactNode } from "react";
import { UserAccessLevel } from "../../../api/services/user/types";
import { useAuth } from "./store";

type AuthPropsBase = {
  children: ReactNode | (() => ReactNode);
  fallback?: ReactNode;
};

export type AuthProps =
  | (AuthPropsBase & { exact: UserAccessLevel })
  | (AuthPropsBase & { atLeast: UserAccessLevel })
  | AuthPropsBase;

/**
 * Renders children only when the user has the required access level
 */
export function Auth({ children, fallback, ...props }: AuthProps) {
  const { user } = useAuth();

  const access = user?.access ?? UserAccessLevel.Guest;
  let allowAccess = false;
  if ("exact" in props) {
    allowAccess = access === props.exact;
  } else if ("atLeast" in props) {
    allowAccess = access >= props.atLeast;
  }

  const childrenFn = typeof children === "function" ? children : () => children;
  return <>{allowAccess ? childrenFn() : fallback}</>;
}
