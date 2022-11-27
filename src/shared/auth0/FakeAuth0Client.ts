import { Stateful } from "../Stateful";
import type { BaseAuth0Client } from "./BaseAuth0Client";
import type { Auth0State } from "./Auth0State";
import { emptyState } from "./Auth0State";

export class FakeAuth0Client
  extends Stateful<Auth0State>
  implements BaseAuth0Client
{
  getTokenSilently = async () => "fake";
  loginWithRedirect = async () =>
    this.setState({
      isAuthenticated: true,
      user: { name: "Fake" } as Auth0State["user"],
    });
  logout = async () => this.setState(emptyState());
}
