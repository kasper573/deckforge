import { createContext, useContext, useEffect, useState } from "react";
import type {
  Auth0ClientOptions,
  User,
  LogoutUrlOptions,
} from "@auth0/auth0-spa-js";
import { Auth0Client } from "@auth0/auth0-spa-js";
import produce from "immer";

export type StatefulAuth0ClientOptions = Auth0ClientOptions &
  Pick<LogoutUrlOptions, "logoutParams">;

export class StatefulAuth0Client<
  TUser extends User = User
> extends Auth0Client {
  private changeListeners: ((state: Auth0State<TUser>) => void)[] = [];

  private _state = emptyState<TUser>();
  get state() {
    return this._state;
  }

  constructor(private statefulOptions: StatefulAuth0ClientOptions) {
    super(statefulOptions);
    this.handleRedirectCallback()
      .catch(() => {})
      .then(this.refreshState);
  }

  loginWithPopup: Auth0Client["loginWithPopup"] = async (...args) => {
    try {
      return await super.loginWithPopup(...args);
    } finally {
      await this.refreshState();
    }
  };

  loginWithRedirect: Auth0Client["loginWithRedirect"] = async (...args) => {
    try {
      return await super.loginWithRedirect(...args);
    } finally {
      await this.refreshState();
    }
  };

  logout = async () => {
    try {
      return super.logout({
        logoutParams: this.statefulOptions.logoutParams,
      });
    } finally {
      await this.refreshState();
    }
  };

  private refreshState = async () => {
    const isAuthenticated = await this.isAuthenticated().catch(() => false);
    if (!isAuthenticated) {
      this.setState(emptyState());
      return;
    }

    const user = await this.getUser<TUser>().catch(() => undefined);

    this.setState({
      isAuthenticated,
      user,
    });
  };

  private setState(changes: Partial<Auth0State<TUser>>) {
    const prevState = this._state;
    this._state = produce(this._state, (draft) => {
      Object.assign(draft, changes);
    });
    if (prevState !== this._state) {
      this.changeListeners.forEach((listener) => listener(this._state));
    }
  }

  subscribe(listener: (state: Auth0State<TUser>) => void) {
    this.changeListeners.push(listener);
    return () => {
      const index = this.changeListeners.indexOf(listener);
      if (index !== -1) {
        this.changeListeners.splice(index, 1);
      }
    };
  }
}

const emptyState = <TUser extends User = User>(): Auth0State<TUser> => ({
  isAuthenticated: false,
  user: undefined,
});

export type Auth0State<TUser extends User = User> = Readonly<{
  user?: Readonly<TUser>;
  isAuthenticated: boolean;
}>;

export function useAuth0() {
  const client = useContext(Auth0Context);
  const [state, setState] = useState(client.state);
  useEffect(() => client.subscribe(setState), [client]);

  return { ...state, ...client };
}

export const Auth0Context = createContext<StatefulAuth0Client>(
  new Proxy({} as StatefulAuth0Client, {
    get() {
      throw new Error("Auth0StateContext not initialized");
    },
  })
);
