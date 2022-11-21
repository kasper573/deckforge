import type { ReactNode } from "react";
import { Providers } from "./providers";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html>
      <head />
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
