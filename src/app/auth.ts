import { StatefulAuth0Client } from "../shared/auth0/StatefulAuth0Client";
import type { BaseAuth0Client } from "../shared/auth0/BaseAuth0Client";
import { FakeAuth0Client } from "../shared/auth0/FakeAuth0Client";
import { fake } from "../api/services/auth/fake";
import { env } from "./env";

export function createAuthClient(): BaseAuth0Client {
  switch (env.authImplementation) {
    case "real":
      return new StatefulAuth0Client({
        ...env.auth0,
        onRedirectCallback() {
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname
          );
        },
      });
    case "fake":
      return new FakeAuth0Client(fake.token, fake.user);
  }
}
