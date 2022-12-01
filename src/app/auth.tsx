import { StatefulAuth0Client } from "../lib/auth0/StatefulAuth0Client";
import type { BaseAuth0Client } from "../lib/auth0/BaseAuth0Client";
import { FakeAuth0Client } from "../lib/auth0/FakeAuth0Client";
import { fake } from "../api/services/auth/fake";
import { env } from "./env";

export function createAuthClient(
  onRedirectCallback?: () => void
): BaseAuth0Client {
  switch (env.authImplementation) {
    case "real":
      return new StatefulAuth0Client({ ...env.auth0, onRedirectCallback });
    case "fake":
      return new FakeAuth0Client(fake.token, fake.jwt);
  }
}
