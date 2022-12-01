import type { User } from "@auth0/auth0-spa-js";

export type Auth0State = Readonly<{
  user?: Readonly<User>;
  isAuthenticated: boolean;
  isLoading: boolean;
}>;

export const emptyState = (): Auth0State => ({
  isAuthenticated: false,
  isLoading: false,
  user: undefined,
});
