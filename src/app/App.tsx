import CssBaseline from "@mui/material/CssBaseline";
import { Analytics } from "@vercel/analytics/react";
import ThemeProvider from "@mui/material/styles/ThemeProvider";
import GlobalStyles from "@mui/material/GlobalStyles";
import * as React from "react";
import type { Theme } from "@mui/material";
import { Layout } from "./layout/Layout";
import { env } from "./env";
import HomePage from "./pages/HomePage";

interface AppProps {
  theme: Theme;
}

function App({ theme }: AppProps) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {globalStyles}
      <Layout>
        <HomePage />
      </Layout>
      {env.VITE_ENABLE_ANALYTICS ? <Analytics /> : undefined}
    </ThemeProvider>
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

export default App;
