import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserHistory } from "history";
import { App } from "./App";
import { createQueryClient, createTRPCClients } from "./trpc";
import { createTheme } from "./theme";
import {
  getAuthToken,
  resetAuthToken,
  setupAuthBehavior,
} from "./features/auth/store";
import { env } from "./env";
import { createStore } from "./store";
import { getInitialEditorState } from "./features/editor/editorState";

if (env.analyticsId) {
  import("@vercel/analytics").then(({ inject }) => inject());
  if (env.webVitalsUrl) {
    import("./webVitals").then(({ sendWebVitals }) => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      sendWebVitals({ url: env.webVitalsUrl!, dsn: env.analyticsId! });
    });
  }
}

const store = createStore(getInitialEditorState());
const queryClient = createQueryClient(resetAuthToken);
const { trpcClient, trpcClientProxy } = createTRPCClients(getAuthToken);
const history = createBrowserHistory();
const theme = createTheme();
setupAuthBehavior({ history });

store.subscribe(() => {
  trpcClientProxy.game.update.mutate(store.getState().editor.present.game);
});

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <App
    store={store}
    theme={theme}
    history={history}
    trpcClient={trpcClient}
    queryClient={queryClient}
  />
);
