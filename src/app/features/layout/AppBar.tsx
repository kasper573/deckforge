import AccountCircle from "@mui/icons-material/AccountCircle";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import Toolbar from "@mui/material/Toolbar";
import Container from "@mui/material/Container";
import MuiAppBar from "@mui/material/AppBar";
import type { ReactNode } from "react";
import { Auth } from "../auth/Auth";
import { OnlineBadge } from "../../components/OnlineBadge";
import { useAuth } from "../auth/store";
import { LinkMenuItem } from "../../components/Link";
import { router } from "../../router";
import { MenuFor } from "../../components/MenuFor";
import { pageMaxWidth } from "./Page";

export function AppBar({ children }: { children?: ReactNode }) {
  const { user, logout } = useAuth();
  return (
    <>
      <MuiAppBar aria-label="header" position="fixed">
        <Toolbar disableGutters>
          <Container maxWidth={pageMaxWidth} sx={{ display: "flex" }}>
            <Stack direction="row" alignItems="center" sx={{ flex: 1 }}>
              <Box>{children}</Box>
              <Box sx={{ ml: "auto" }}>
                <MenuFor
                  MenuListProps={{ "aria-label": "User menu" }}
                  trigger={({ open }) => (
                    <IconButton
                      aria-label="show user menu"
                      sx={{ ml: 1 }}
                      onClick={open}
                    >
                      {user ? (
                        <OnlineBadge data-testid="online-indicator">
                          <AccountCircle />
                        </OnlineBadge>
                      ) : (
                        <AccountCircle />
                      )}
                    </IconButton>
                  )}
                >
                  <Auth exact="Guest">
                    <LinkMenuItem to={router.user().login()}>
                      Sign in
                    </LinkMenuItem>
                    <LinkMenuItem to={router.user().register()}>
                      Register
                    </LinkMenuItem>
                  </Auth>
                  <Auth>
                    <ListItem sx={{ pt: 0 }}>
                      <ListItemText
                        primaryTypographyProps={{ noWrap: true }}
                        primary={
                          <>
                            Signed in as <strong>{user?.name}</strong>
                          </>
                        }
                      />
                    </ListItem>
                    <Divider sx={{ mb: 1 }} />
                    <LinkMenuItem to={router.build()}>Your games</LinkMenuItem>
                    <LinkMenuItem to={router.user().profile()}>
                      Account settings
                    </LinkMenuItem>
                    <MenuItem onClick={() => logout()}>Sign out</MenuItem>
                  </Auth>
                </MenuFor>
              </Box>
            </Stack>
          </Container>
        </Toolbar>
      </MuiAppBar>
      <Toolbar />
    </>
  );
}
