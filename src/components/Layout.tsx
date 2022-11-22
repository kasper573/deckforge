import { styled } from "@mui/system";
import type { ReactNode } from "react";
import MuiContainer from "@mui/material/Container";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Link from "./Link";

export function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <AppBar>
        <Toolbar>
          <Link href="/">Deck Forge</Link>
        </Toolbar>
      </AppBar>
      <Toolbar />
      <Container>{children}</Container>
    </>
  );
}

const Container = styled(MuiContainer)`
  padding-top: ${({ theme }) => theme.spacing(2)};
  flex: 1;
`;
