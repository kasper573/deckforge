import type { ReactNode } from "react";
import { Suspense } from "react";
import { styled } from "@mui/material/styles";
import { LoadingPage } from "../common/LoadingPage";
import { AppBar } from "./AppBar";
import { Logo } from "./Logo";

export function Layout({ children }: { children?: ReactNode }) {
  return (
    <>
      <AppBar>
        <Logo />
      </AppBar>
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
