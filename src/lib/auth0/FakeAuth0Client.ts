import { Stateful } from "../Stateful";
import type { BaseAuth0Client } from "./BaseAuth0Client";
import type { Auth0State } from "./Auth0State";
import { emptyState } from "./Auth0State";

export class FakeAuth0Client
  extends Stateful<Auth0State>
  implements BaseAuth0Client
{
  constructor(private fakeToken: string, private fakeUser: Auth0State["user"]) {
    super({ isAuthenticated: false });
  }
  getTokenSilently = async () => this.fakeToken;
  loginWithRedirect = async () =>
    this.setState({
      isAuthenticated: true,
      user: {
        name: this.fakeUser?.name,
      },
    });
  logout = async () => this.setState(emptyState());
}
