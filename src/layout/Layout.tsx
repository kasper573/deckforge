import type { CSSProperties, ReactNode } from "react";
import { useEffect, useState } from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Toolbar from "@mui/material/Toolbar";
import useTheme from "@mui/material/styles/useTheme";
import Drawer from "@mui/material/Drawer";
import { Menu as MenuIcon } from "../components/icons";
import { useReadyMediaQuery } from "../hooks/useReadyMediaQuery";
import { ToolbarContent } from "./ToolbarContent";
import { Menu } from "./Menu";
import { Logo } from "./Logo";
import { pageMaxWidth } from "./Page";

export function Layout({ children }: { children?: ReactNode }) {
  const theme = useTheme();
  const isDrawerPermanent = useReadyMediaQuery(theme.breakpoints.up("md"));
  const [isDrawerOpen, setDrawerOpen] = useState(isDrawerPermanent === true);

  useEffect(() => {
    if (isDrawerPermanent !== undefined) {
      setDrawerOpen(isDrawerPermanent);
    }
  }, [isDrawerPermanent]);

  function handleDrawerCloseRequest() {
    if (!isDrawerPermanent) {
      setDrawerOpen(false);
    }
  }

  const drawerWidth = 240;
  const contentBounds: CSSProperties = {
    width: isDrawerPermanent ? `calc(100% - ${drawerWidth}px)` : undefined,
    marginLeft: isDrawerPermanent ? `${drawerWidth}px` : undefined,
    display: "flex",
    flexDirection: "column",
    flex: 1,
  };

  return (
    <>
      <AppBar position="fixed" sx={contentBounds}>
        <Toolbar disableGutters>
          <Container maxWidth={pageMaxWidth} sx={{ display: "flex" }}>
            <ToolbarContent>
              {!isDrawerPermanent && (
                <Stack direction="row" spacing={1} alignItems="center">
                  <IconButton
                    aria-label="Open main menu"
                    onClick={() => setDrawerOpen(true)}
                  >
                    <MenuIcon />
                  </IconButton>
                  <Logo>Deck Forge</Logo>
                </Stack>
              )}
            </ToolbarContent>
          </Container>
        </Toolbar>
      </AppBar>
      <Drawer
        aria-label="Main menu"
        variant={isDrawerPermanent ? "permanent" : "temporary"}
        open={isDrawerOpen}
        onClose={handleDrawerCloseRequest}
        sx={{
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: drawerWidth,
          },
        }}
      >
        <Toolbar sx={{ "&": { padding: 0 } }}>
          <Box sx={{ display: "flex", justifyContent: "center", flex: 1 }}>
            <Logo onClick={handleDrawerCloseRequest}>Deck Forge</Logo>
          </Box>
        </Toolbar>
        <Menu onItemSelected={handleDrawerCloseRequest} />
      </Drawer>
      <Toolbar />
      <Box component="main" sx={contentBounds}>
        {children}
      </Box>
    </>
  );
}
