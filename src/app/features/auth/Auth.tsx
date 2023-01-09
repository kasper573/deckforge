import type { ReactNode } from "react";
import type { UserRole } from "../../../api/services/user/types";
import { roleToAccessLevel } from "../../../api/services/user/types";
import { useAuth } from "./store";

type AuthPropsBase = {
  children: ReactNode | AuthContentRenderer;
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

  const renderContent: AuthContentRenderer =
    typeof children === "function"
      ? children
      : ({ allowAccess }) => (allowAccess ? children : fallback);

  return <>{renderContent({ allowAccess, access })}</>;
}

type AuthContentRenderer = (props: {
  allowAccess: boolean;
  access: number;
}) => ReactNode;
