import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserHistory } from "history";
import { App } from "./App";
import { queryClient, createTRPCClient } from "./trpc";
import { createTheme } from "./theme";
import { createAuthClient } from "./auth";

const history = createBrowserHistory();
const theme = createTheme();
const trpcClient = createTRPCClient(() => authClient.getTokenSilently());
const authClient = createAuthClient();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <App
    theme={theme}
    history={history}
    authClient={authClient}
    trpcClient={trpcClient}
    queryClient={queryClient}
  />
);
