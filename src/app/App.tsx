import CssBaseline from "@mui/material/CssBaseline";
import { Analytics } from "@vercel/analytics/react";
import GlobalStyles from "@mui/material/GlobalStyles";
import * as React from "react";
import type { QueryClient } from "@tanstack/react-query";
import { QueryClientProvider } from "@tanstack/react-query";
import ThemeProvider from "@mui/material/styles/ThemeProvider";
import type { Theme } from "@mui/material";
import type { TRPCClient } from "@trpc/client";
import { Router } from "react-router";
import { RouterSwitch } from "react-typesafe-routes";
import type { History } from "history";
import type { ApiRouter } from "../api/router";
import { Auth0Context } from "../lib/auth0/useAuth0";
import type { BaseAuth0Client } from "../lib/auth0/BaseAuth0Client";
import { DialogOutlet } from "../lib/useDialog";
import { Layout } from "./layout/Layout";
import { env } from "./env";
import { trpc } from "./trpc";
import { router } from "./router";
import {
  ErrorBoundary,
  PlainErrorFallback,
  PrettyErrorFallback,
} from "./ErrorFallback";

export function App({
  authClient,
  trpcClient,
  queryClient,
  theme,
  history,
}: {
  authClient: BaseAuth0Client;
  trpcClient: TRPCClient<ApiRouter>;
  queryClient: QueryClient;
  theme: Theme;
  history: History;
}) {
  return (
    <React.StrictMode>
      <ErrorBoundary fallback={PlainErrorFallback} onError={console.error}>
        <trpc.Provider client={trpcClient} queryClient={queryClient}>
          <QueryClientProvider client={queryClient}>
            <Auth0Context.Provider value={authClient}>
              <Router history={history}>
                <ThemeProvider theme={theme}>
                  <CssBaseline />
                  {globalStyles}
                  <Layout>
                    <ErrorBoundary
                      fallback={PrettyErrorFallback}
                      onError={console.error}
                    >
                      <RouterSwitch router={router} />
                    </ErrorBoundary>
                  </Layout>
                  {env.enableAnalytics ? <Analytics /> : undefined}
                  <DialogOutlet />
                </ThemeProvider>
              </Router>
            </Auth0Context.Provider>
          </QueryClientProvider>
        </trpc.Provider>
      </ErrorBoundary>
    </React.StrictMode>
  );
}

const globalStyles = (
  <GlobalStyles
    styles={{
      [`html, body, #root`]: {
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      },
    }}
  />
);
