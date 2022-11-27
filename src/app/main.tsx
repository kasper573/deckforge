import React from "react";
import ReactDOM from "react-dom/client";
import { StatefulAuth0Client } from "../shared/auth0-react";
import { App } from "./App";
import { queryClient, createTRPCClient } from "./trpc";
import { createTheme } from "./theme";
import { env } from "./env";

const theme = createTheme();
const authClient = new StatefulAuth0Client(env.auth0);
const trpcClient = createTRPCClient(() => authClient.getTokenSilently());

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <App
    theme={theme}
    authClient={authClient}
    trpcClient={trpcClient}
    queryClient={queryClient}
  />
);
