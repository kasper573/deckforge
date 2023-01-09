import type { ReactNode } from "react";
import { Suspense } from "react";
import { styled } from "@mui/material/styles";
import { useRouteOptions } from "react-typesafe-routes";
import { useIsFetching, useIsMutating } from "@tanstack/react-query";
import { LoadingPage } from "../common/LoadingPage";
import { router } from "../../router";
import { LoadingIndicator } from "../../components/LoadingIndicator";
import { AppBar } from "./AppBar";

export function Layout({ children }: { children?: ReactNode }) {
  return (
    <>
      <AppBarSlot />
      <Content>
        <Suspense fallback={<LoadingPage />}>
          <GlobalLoadingIndicator />
          {children}
        </Suspense>
      </Content>
    </>
  );
}

const Content = styled("main")`
  display: flex;
  flex-direction: column;
  flex: 1;
  position: relative;
`;

function AppBarSlot() {
  const {
    appBar: { content: Content, container },
  } = useRouteOptions(router);
  return (
    <AppBar container={container}>
      <Suspense>
        <Content />
      </Suspense>
    </AppBar>
  );
}

function GlobalLoadingIndicator() {
  const { globalLoadingIndicator } = useRouteOptions(router);
  const fetchCount = useIsFetching();
  const mutationCount = useIsMutating();
  const isLoading = fetchCount > 0 || mutationCount > 0;
  if (!globalLoadingIndicator || !isLoading) {
    return null;
  }
  return (
    <LoadingIndicator
      variant="linear"
      sx={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
      }}
    />
  );
}
