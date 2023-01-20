import ReactDOM from "react-dom/client";
import { createBrowserHistory } from "history";
import {
  createOfflineGameService,
  shouldUseOfflineGameService,
} from "../api/services/game/offline";
import { App } from "./App";
import { createQueryClient, createTRPCClient } from "./trpc";
import { createTheme } from "./theme";
import {
  authStore,
  getAuthToken,
  resetAuthToken,
  setupAuthBehavior,
} from "./features/auth/store";
import { env } from "./env";

if (env.analyticsId) {
  import("@vercel/analytics").then(({ inject }) => inject());
  if (env.webVitalsUrl) {
    import("./webVitals").then(({ sendWebVitals }) => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      sendWebVitals({ url: env.webVitalsUrl!, dsn: env.analyticsId! });
    });
  }
}

const theme = createTheme();
const history = createBrowserHistory();
const offlineGameService = createOfflineGameService();
const queryClient = createQueryClient({ onBadToken: resetAuthToken });
const trpcClient = createTRPCClient({
  getAuthToken,
  interceptors: () => ({
    game: shouldUseOfflineGameService(authStore.getState())
      ? offlineGameService
      : undefined,
  }),
});

setupAuthBehavior({ history });

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <App
    theme={theme}
    history={history}
    trpcClient={trpcClient}
    queryClient={queryClient}
  />
);
