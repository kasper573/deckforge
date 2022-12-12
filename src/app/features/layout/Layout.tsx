import type { ReactNode } from "react";
import { Suspense } from "react";
import { styled } from "@mui/material/styles";
import { useRouteOptions } from "react-typesafe-routes";
import { LoadingPage } from "../common/LoadingPage";
import { router } from "../../router";
import { AppBar } from "./AppBar";

export function Layout({ children }: { children?: ReactNode }) {
  return (
    <>
      <AppBarSlot />
      <Content>
        <Suspense fallback={<LoadingPage />}>{children}</Suspense>
      </Content>
    </>
  );
}

const Content = styled("main")`
  display: flex;
  flex-direction: column;
  flex: 1;
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
