import type { Auth0Client, GetTokenSilentlyOptions } from "@auth0/auth0-spa-js";
import type { Stateful } from "../Stateful";
import type { Auth0State } from "./Auth0State";

export interface BaseAuth0Client extends Stateful<Auth0State> {
  loginWithRedirect: Auth0Client["loginWithRedirect"];
  getTokenSilently(options?: GetTokenSilentlyOptions): Promise<string>;
  logout: Auth0Client["logout"];
}
