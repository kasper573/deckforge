import { SessionProvider } from "next-auth/react";
import { Analytics } from "@vercel/analytics/react";
import type { EmotionCache } from "@emotion/react";
import { CacheProvider } from "@emotion/react";
import Head from "next/head";
import { CssBaseline, ThemeProvider } from "@mui/material";
import type { Session } from "next-auth";
import type { AppProps } from "next/app";
import { theme } from "../app/theme";
import { trpc } from "../app/trpc";
import { env } from "../env/client.mjs";
import createEmotionCache from "../app/createEmotionCache";
import { Layout } from "../components/Layout";

export interface MyAppProps extends AppProps<{ session?: Session }> {
  emotionCache: EmotionCache;
}

export type MyAppType = typeof MyApp;

function MyApp({
  Component,
  emotionCache = clientSideEmotionCache,
  pageProps: { session, ...pageProps },
}: MyAppProps) {
  return (
    <CacheProvider value={emotionCache}>
      <Head>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </Head>
      <ThemeProvider theme={theme}>
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

export default trpc.withTRPC(MyApp);
