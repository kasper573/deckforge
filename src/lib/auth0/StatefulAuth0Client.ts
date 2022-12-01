import type { Auth0ClientOptions, LogoutUrlOptions } from "@auth0/auth0-spa-js";
import { Auth0Client } from "@auth0/auth0-spa-js";
import { Stateful } from "./Stateful";
import type { BaseAuth0Client } from "./BaseAuth0Client";
import type { Auth0State } from "./Auth0State";
import { emptyState } from "./Auth0State";

export type StatefulAuth0ClientOptions = Auth0ClientOptions &
  Pick<LogoutUrlOptions, "logoutParams"> & {
    onRedirectCallback?: () => void;
  };

export class StatefulAuth0Client
  extends Stateful<Auth0State>
  implements BaseAuth0Client
{
  private auth0Client: Auth0Client;

  constructor(private options: StatefulAuth0ClientOptions) {
    super(emptyState());
    this.auth0Client = new Auth0Client(this.options);
    this.auth0Client
      .handleRedirectCallback()
      .catch(() => {})
      .then(() => {
        options.onRedirectCallback?.();
        return this.refreshState();
      });
  }

  getTokenSilently: BaseAuth0Client["getTokenSilently"] = (...args) =>
    this.auth0Client.getTokenSilently(...args);

  loginWithRedirect: BaseAuth0Client["loginWithRedirect"] = async (...args) => {
    try {
      return await this.auth0Client.loginWithRedirect(...args);
    } finally {
      await this.refreshState();
    }
  };

  logout = async () => {
    try {
      return this.auth0Client.logout({
        logoutParams: this.options.logoutParams,
      });
    } finally {
      await this.refreshState();
    }
  };

  private refreshState = async () => {
    const isAuthenticated = await this.auth0Client
      .isAuthenticated()
      .catch(() => false);
    if (!isAuthenticated) {
      this.setState(emptyState());
      return;
    }

    const user = await this.auth0Client.getUser().catch(() => undefined);

    this.setState({
      isAuthenticated,
      user,
    });
  };
}
