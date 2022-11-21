"use client";

import { Analytics } from "@vercel/analytics/react";
import type { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";
import { env } from "../env/client.mjs";
import { ClientProvider } from "./trpcClient";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <>
      <SessionProvider>
        <ClientProvider>{children}</ClientProvider>
      </SessionProvider>
      {env.NEXT_PUBLIC_ENABLE_ANALYTICS ? <Analytics /> : undefined}
    </>
  );
}
