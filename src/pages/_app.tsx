import { SessionProvider } from "next-auth/react";
import { Analytics } from "@vercel/analytics/react";
import type { EmotionCache } from "@emotion/react";
import { CacheProvider } from "@emotion/react";
import Head from "next/head";
import CssBaseline from "@mui/material/CssBaseline";
import type { Session } from "next-auth";
import type { AppProps } from "next/app";
import ThemeProvider from "@mui/material/styles/ThemeProvider";
import type { Theme } from "@mui/material";
import { createTheme } from "../app/theme";
import { trpc } from "../app/trpc";
import { env } from "../env/client.mjs";
import createEmotionCache from "../app/createEmotionCache";
import { Layout } from "../layout/Layout";

export interface MyAppProps extends AppProps<{ session?: Session }> {
  emotionCache: EmotionCache;
  muiTheme: Theme;
}

export type MyAppType = typeof MyApp;

function MyApp({
  Component,
  muiTheme = clientSideMuiTheme,
  emotionCache = clientSideEmotionCache,
  pageProps: { session, ...pageProps },
}: MyAppProps) {
  return (
    <CacheProvider value={emotionCache}>
      <Head>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </Head>
      <ThemeProvider theme={muiTheme}>
        <CssBaseline />
        <SessionProvider session={session}>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </SessionProvider>
        {env.NEXT_PUBLIC_ENABLE_ANALYTICS ? <Analytics /> : undefined}
      </ThemeProvider>
    </CacheProvider>
  );
}

// Client-side cache, shared for the whole session of the user in the browser.
const clientSideEmotionCache = createEmotionCache();
const clientSideMuiTheme = createTheme();

export default trpc.withTRPC(MyApp);
