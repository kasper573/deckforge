import type { UserRole } from "@prisma/client";
import type { RouteMiddleware } from "react-typesafe-routes";
import type { ComponentType } from "react";
import { useAuth0 } from "../../lib/auth0/useAuth0";
import { getAccessLevel } from "../../api/services/auth/utils";

export function createAccessFactory({
  LoadingPage,
  NotAuthenticatedPage,
  NotPermittedPage,
}: {
  LoadingPage: ComponentType;
  NotAuthenticatedPage: ComponentType;
  NotPermittedPage: ComponentType;
}) {
  return function access(requiredRole: UserRole = "User"): RouteMiddleware {
    return (LockedPage) => {
      function Access() {
        const { isAuthenticated, isLoading } = useAuth0();
        if (isLoading) {
          return <LoadingPage />;
        }
        if (!isAuthenticated) {
          return <NotAuthenticatedPage />;
        }
        if (getAccessLevel("User") < getAccessLevel(requiredRole)) {
          return <NotPermittedPage />;
        }
        return <LockedPage />;
      }

      return Access;
    };
  };
}
