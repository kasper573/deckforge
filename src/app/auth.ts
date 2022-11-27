import { z } from "zod";
import { StatefulAuth0Client } from "../shared/auth0/StatefulAuth0Client";
import { env } from "./env";

export type AuthImplementation = z.infer<typeof authImplementationType>;
export const authImplementationType = z.enum(["real", "fake"]);

export function createAuthClient(): StatefulAuth0Client {
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
      return new Proxy({} as StatefulAuth0Client, {
        get() {
          throw new Error("Not implemented");
        },
      });
  }
}
