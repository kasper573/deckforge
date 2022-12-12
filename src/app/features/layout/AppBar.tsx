import Box from "@mui/material/Box";
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
  let content = (
    <Stack direction="row" alignItems="center" sx={{ flex: 1 }}>
      <Box sx={{ flex: 1 }}>{children}</Box>
      <div>
        <UserMenu edge="end" />
      </div>
    </Stack>
  );
  if (container) {
    content = <Container maxWidth={pageMaxWidth}>{content}</Container>;
  }
  return (
    <>
      <MuiAppBar aria-label="header" position="fixed">
        <Toolbar disableGutters={container}>{content}</Toolbar>
      </MuiAppBar>
      <Toolbar />
    </>
  );
}
