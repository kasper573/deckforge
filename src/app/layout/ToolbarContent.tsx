import AccountCircle from "@mui/icons-material/AccountCircle";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import type { ReactNode } from "react";
import { MenuOn } from "../components/MenuOn";
import { Auth } from "../components/Auth";
import { OnlineBadge } from "../components/OnlineBadge";
import { useAuth0 } from "../../shared/auth0/useAuth0";

export function ToolbarContent({ children }: { children?: ReactNode }) {
  const { user, loginWithRedirect, logout } = useAuth0();

  return (
    <Stack direction="row" alignItems="center" sx={{ flex: 1 }}>
      <Box>{children}</Box>
      <Box sx={{ ml: "auto" }}>
        <MenuOn
          MenuListProps={{ "aria-label": "User menu" }}
          trigger={({ toggle }) => (
            <IconButton
              aria-label="Open user menu"
              sx={{ ml: 1 }}
              onClick={toggle}
            >
              {user ? (
                <OnlineBadge>
                  <AccountCircle />
                </OnlineBadge>
              ) : (
                <AccountCircle />
              )}
            </IconButton>
          )}
        >
          <Auth exact="Guest">
            <MenuItem onClick={() => loginWithRedirect()}>Sign in</MenuItem>
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
            <MenuItem onClick={() => logout()}>Sign out</MenuItem>
          </Auth>
        </MenuOn>
      </Box>
    </Stack>
  );
}
