import CssBaseline from "@mui/material/CssBaseline";
import { Analytics } from "@vercel/analytics/react";
import GlobalStyles from "@mui/material/GlobalStyles";
import * as React from "react";
import type { QueryClient } from "@tanstack/react-query";
import { QueryClientProvider } from "@tanstack/react-query";
import ThemeProvider from "@mui/material/styles/ThemeProvider";
import type { Theme } from "@mui/material";
import type { TRPCClient } from "@trpc/client";
import type { ReactNode } from "react";
import type { ApiRouter } from "../api/router";
import { Auth0Context } from "../shared/auth0/useAuth0";
import type { StatefulAuth0Client } from "../shared/auth0/StatefulAuth0Client";
import { Layout } from "./layout/Layout";
import { env } from "./env";
import HomePage from "./pages/HomePage";
import { trpc } from "./trpc";

export function App({
  authClient,
  trpcClient,
  queryClient,
  theme,
  children,
}: {
  authClient: StatefulAuth0Client;
  trpcClient: TRPCClient<ApiRouter>;
  queryClient: QueryClient;
  theme: Theme;
  children?: ReactNode;
}) {
  return (
    <React.StrictMode>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          <Auth0Context.Provider value={authClient}>
            <ThemeProvider theme={theme}>
              <CssBaseline />
              {globalStyles}
              <Layout>
                <HomePage />
                {children}
              </Layout>
              {env.enableAnalytics ? <Analytics /> : undefined}
            </ThemeProvider>
          </Auth0Context.Provider>
        </QueryClientProvider>
      </trpc.Provider>
    </React.StrictMode>
  );
}

const globalStyles = (
  <GlobalStyles
    styles={{
      [`html, body, #__next`]: {
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      },
    }}
  />
);
