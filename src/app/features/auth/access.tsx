import type { RouteMiddleware } from "react-typesafe-routes";
import type { ComponentType } from "react";
import { UserAccessLevel } from "../../../api/services/user/types";
import { useAuth } from "./store";

export function createAccessFactory({
  NotAuthenticatedPage,
  NotPermittedPage,
}: {
  NotAuthenticatedPage: ComponentType;
  NotPermittedPage: ComponentType;
}) {
  return function access(
    requiredAccess = UserAccessLevel.User
  ): RouteMiddleware {
    return (LockedPage) => {
      function Access() {
        const { isAuthenticated, user } = useAuth();
        if (!isAuthenticated) {
          return <NotAuthenticatedPage />;
        }
        if (!user || user?.access < requiredAccess) {
          return <NotPermittedPage />;
        }
        return <LockedPage />;
      }

      return Access;
    };
  };
}
