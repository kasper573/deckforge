import type { User } from "@auth0/auth0-spa-js";

export type Auth0State = Readonly<{
  user?: Readonly<User>;
  isAuthenticated: boolean;
}>;

export const emptyState = (): Auth0State => ({
  isAuthenticated: false,
  user: undefined,
});
