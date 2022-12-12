import type { ReactNode } from "react";
import { Suspense } from "react";
import AppBar from "@mui/material/AppBar";
import Container from "@mui/material/Container";
import Toolbar from "@mui/material/Toolbar";
import { styled } from "@mui/material/styles";
import { LoadingPage } from "../common/LoadingPage";
import { ToolbarContent } from "./ToolbarContent";
import { pageMaxWidth } from "./Page";

export function Layout({ children }: { children?: ReactNode }) {
  return (
    <>
      <AppBar aria-label="header" position="fixed">
        <Toolbar disableGutters>
          <Container maxWidth={pageMaxWidth} sx={{ display: "flex" }}>
            <ToolbarContent />
          </Container>
        </Toolbar>
      </AppBar>

      <Toolbar />

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
