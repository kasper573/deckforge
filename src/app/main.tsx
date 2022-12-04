import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserHistory } from "history";
import { inject } from "@vercel/analytics";
import { App } from "./App";
import { createQueryClient, createTRPCClient } from "./trpc";
import { createTheme } from "./theme";
import {
  getAuthToken,
  resetAuthToken,
  setupAuthBehavior,
} from "./features/auth/store";
import { env } from "./env";

if (env.enableAnalytics) {
  inject();
}

const queryClient = createQueryClient(resetAuthToken);
const trpcClient = createTRPCClient(getAuthToken);
const history = createBrowserHistory();
const theme = createTheme();
setupAuthBehavior({ history });

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <App
    theme={theme}
    history={history}
    trpcClient={trpcClient}
    queryClient={queryClient}
  />
);
