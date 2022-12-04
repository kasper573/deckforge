import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserHistory } from "history";
import { App } from "./App";
import { createQueryClient, createTRPCClient } from "./trpc";
import { createTheme } from "./theme";
import { getAuthToken, setupAuthBehavior } from "./features/auth/store";

const queryClient = createQueryClient();
const history = createBrowserHistory();
const theme = createTheme();
const trpcClient = createTRPCClient(getAuthToken);
setupAuthBehavior({ history });

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <App
    theme={theme}
    history={history}
    trpcClient={trpcClient}
    queryClient={queryClient}
  />
);
