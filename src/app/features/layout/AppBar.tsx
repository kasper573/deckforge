import Stack from "@mui/material/Stack";
import Toolbar from "@mui/material/Toolbar";
import Container from "@mui/material/Container";
import MuiAppBar from "@mui/material/AppBar";
import type { ReactNode } from "react";
import { pageMaxWidth } from "./Page";
import { UserMenu } from "./UserMenu";
import { Logo } from "./Logo";

export function AppBar({
  children = <Logo />,
  container = true,
}: {
  children?: ReactNode;
  container?: boolean;
}) {
  return (
    <>
      <MuiAppBar aria-label="header" position="fixed">
        <AppToolbar disableGutters>
          <Container maxWidth={container ? pageMaxWidth : false}>
            <Stack direction="row" alignItems="center" sx={{ flex: 1 }}>
              <Stack direction="row" sx={{ flex: 1 }}>
                {children}
              </Stack>
              <div>
                <UserMenu edge="end" />
              </div>
            </Stack>
          </Container>
        </AppToolbar>
      </MuiAppBar>
      <AppToolbar />
    </>
  );
}

export const AppToolbar = Toolbar;
