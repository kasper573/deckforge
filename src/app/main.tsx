import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import { queryClient, trpc, trpcClient } from "./trpc";
import { createTheme } from "./theme";

const theme = createTheme();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <App theme={theme} />
      </QueryClientProvider>
    </trpc.Provider>
  </React.StrictMode>
);
