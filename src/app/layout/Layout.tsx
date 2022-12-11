import type { ReactNode } from "react";
import { Suspense } from "react";
import { useState } from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Toolbar from "@mui/material/Toolbar";
import MuiDrawer from "@mui/material/Drawer";
import { styled } from "@mui/material/styles";
import useTheme from "@mui/material/styles/useTheme";
import useMediaQuery from "@mui/material/useMediaQuery";
import { Menu as MenuIcon } from "../components/icons";
import { LoadingPage } from "../features/common/LoadingPage";
import { ToolbarContent } from "./ToolbarContent";
import { Navigation } from "./Navigation";
import { Logo } from "./Logo";
import { pageMaxWidth } from "./Page";

export function Layout({ children }: { children?: ReactNode }) {
  const theme = useTheme();
  const isLargeDisplay = useMediaQuery(theme.breakpoints.up(breakpoint));
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const closeDrawer = () => setDrawerOpen(false);

  return (
    <>
      <AppBar aria-label="header" position="fixed">
        <Toolbar disableGutters>
          <Container maxWidth={pageMaxWidth} sx={{ display: "flex" }}>
            <ToolbarContent>
              <SmallDeviceToolbarTitle
                direction="row"
                spacing={1}
                alignItems="center"
              >
                <IconButton
                  aria-label="Show main menu"
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

      <Drawer
        role="navigation"
        aria-label="Main menu"
        variant={isLargeDisplay ? "permanent" : "temporary"}
        open={isDrawerOpen}
        onClose={closeDrawer}
      >
        <Toolbar sx={{ "&": { padding: 0 } }}>
          <Box sx={{ display: "flex", justifyContent: "center", flex: 1 }}>
            <Logo onClick={closeDrawer} />
          </Box>
        </Toolbar>
        <Navigation onItemSelected={closeDrawer} />
      </Drawer>

      <Toolbar />

      <Content>
        <Suspense fallback={<LoadingPage />}>{children}</Suspense>
      </Content>
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
  display: flex;
  flex-direction: column;
  flex: 1;
  ${({ theme }) => theme.breakpoints.up(breakpoint)} {
    margin-left: ${drawerWidth}px;
  }
`;

const SmallDeviceToolbarTitle = styled(Stack)`
  ${({ theme }) => theme.breakpoints.up(breakpoint)} {
    display: none;
  }
`;
