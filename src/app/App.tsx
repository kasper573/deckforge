import CssBaseline from "@mui/material/CssBaseline";
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
import { Provider as ReduxProvider } from "react-redux";
import type { ApiRouter } from "../api/router";
import { ModalOutlet } from "../lib/useModal";
import { Layout } from "./features/layout/Layout";
import { trpc } from "./trpc";
import { router } from "./router";
import {
  ErrorBoundary,
  PlainErrorFallback,
  PrettyErrorFallback,
} from "./ErrorBoundary";
import type { AppStore } from "./store";
import { MenuOutlet } from "./hooks/useMenu";

export function App({
  trpcClient,
  queryClient,
  theme,
  history,
  store,
}: {
  trpcClient: TRPCClient<ApiRouter>;
  queryClient: QueryClient;
  theme: Theme;
  history: History;
  store: AppStore;
}) {
  return (
    <React.StrictMode>
      <ErrorBoundary fallback={PlainErrorFallback} onError={console.error}>
        <ReduxProvider store={store}>
          <trpc.Provider client={trpcClient} queryClient={queryClient}>
            <QueryClientProvider client={queryClient}>
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
                      <ModalOutlet />
                    </ErrorBoundary>
                    <MenuOutlet />
                  </Layout>
                </ThemeProvider>
              </Router>
            </QueryClientProvider>
          </trpc.Provider>
        </ReduxProvider>
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
      a: {
        [`&:hover, &:link, &:visited, &:active`]: {
          textDecoration: "none",
        },
      },
    }}
  />
);
