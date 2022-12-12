import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Toolbar from "@mui/material/Toolbar";
import Container from "@mui/material/Container";
import MuiAppBar from "@mui/material/AppBar";
import type { ReactNode } from "react";
import { pageMaxWidth } from "./Page";
import { UserMenu } from "./UserMenu";

export function AppBar({ children }: { children?: ReactNode }) {
  return (
    <>
      <MuiAppBar aria-label="header" position="fixed">
        <Toolbar disableGutters>
          <Container maxWidth={pageMaxWidth} sx={{ display: "flex" }}>
            <Stack direction="row" alignItems="center" sx={{ flex: 1 }}>
              <Box>{children}</Box>
              <Box sx={{ ml: "auto" }}>
                <UserMenu />
              </Box>
            </Stack>
          </Container>
        </Toolbar>
      </MuiAppBar>
      <Toolbar />
    </>
  );
}
