import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserHistory } from "history";
import { QueryClient } from "@tanstack/react-query";
import { App } from "./App";
import { createTRPCClient } from "./trpc";
import { createTheme } from "./theme";
import { createAuthClient } from "./auth";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      suspense: true,
      // 4s to match cypress timeout
      retry: 4,
      retryDelay: 1000,
    },
  },
});
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
