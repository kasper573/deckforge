import { type AppType } from "next/app";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { Analytics } from "@vercel/analytics/react";
import { trpc } from "../utils/trpc";
import "../styles/globals.css";
import { env } from "../env/client.mjs";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <>
      <SessionProvider session={session}>
        <Component {...pageProps} />
      </SessionProvider>
      {env.NEXT_PUBLIC_ENABLE_ANALYTICS ? <Analytics /> : undefined}
    </>
  );
};

export default trpc.withTRPC(MyApp);
