import type { ReactNode } from "react";
import { useState } from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Toolbar from "@mui/material/Toolbar";
import MuiDrawer from "@mui/material/Drawer";
import { styled } from "@mui/material/styles";
import { Menu as MenuIcon } from "../components/icons";
import { ToolbarContent } from "./ToolbarContent";
import { Navigation } from "./Navigation";
import { Logo } from "./Logo";
import { pageMaxWidth } from "./Page";

export function Layout({ children }: { children?: ReactNode }) {
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const closeDrawer = () => setDrawerOpen(false);

  const drawerProps = {
    "aria-label": "Main menu",
    children: (
      <>
        <Toolbar sx={{ "&": { padding: 0 } }}>
          <Box sx={{ display: "flex", justifyContent: "center", flex: 1 }}>
            <Logo onClick={closeDrawer} />
          </Box>
        </Toolbar>
        <Navigation onItemSelected={closeDrawer} />
      </>
    ),
  };

  return (
    <>
      <AppBar position="fixed">
        <Toolbar disableGutters>
          <Container maxWidth={pageMaxWidth} sx={{ display: "flex" }}>
            <ToolbarContent>
              <SmallDeviceToolbarTitle
                direction="row"
                spacing={1}
                alignItems="center"
              >
                <IconButton
                  aria-label="Open main menu"
                  onClick={() => setDrawerOpen(true)}
                >
                  <MenuIcon />
                </IconButton>
                <Logo />
              </SmallDeviceToolbarTitle>
            </ToolbarContent>
          </Container>
        </Toolbar>
      </AppBar>

      <LargeDeviceDrawer variant="permanent" open {...drawerProps} />
      <SmallDeviceDrawer
        variant="temporary"
        open={isDrawerOpen}
        disablePortal
        onClose={closeDrawer}
        {...drawerProps}
      />

      <Toolbar />

      <Content>{children}</Content>
    </>
  );
}

const breakpoint = "md" as const;
const drawerWidth = 240;

const Drawer = styled(MuiDrawer)`
  .MuiDrawer-paper {
    width: ${drawerWidth}px;
  }
`;

const Content = styled("main")`
  ${({ theme }) => theme.breakpoints.up(breakpoint)} {
    margin-left: ${drawerWidth}px;
  }
`;

const LargeDeviceDrawer = styled(Drawer)`
  ${({ theme }) => theme.breakpoints.down(breakpoint)} {
    display: none;
  }
`;

const SmallDeviceDrawer = styled(Drawer)`
  ${({ theme }) => theme.breakpoints.up(breakpoint)} {
    display: none;
  }
`;

const SmallDeviceToolbarTitle = styled(Stack)`
  ${({ theme }) => theme.breakpoints.up(breakpoint)} {
    display: none;
  }
`;
