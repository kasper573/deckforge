import AccountCircle from "@mui/icons-material/AccountCircle";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import type { ReactNode } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { MenuOn } from "../components/MenuOn";
import { Auth } from "../components/Auth";
import { OnlineBadge } from "../components/OnlineBadge";
import { useSession } from "../hooks/useSession";
import { env } from "../env";

export function ToolbarContent({ children }: { children?: ReactNode }) {
  const { data: session } = useSession();
  const auth0 = useAuth0();
  const signOut = () => auth0.logout({ returnTo: env.auth0.returnUri });
  const signIn = () => auth0.loginWithRedirect();
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
              {session?.user ? (
                <OnlineBadge>
                  <AccountCircle />
                </OnlineBadge>
              ) : (
                <AccountCircle />
              )}
            </IconButton>
          )}
        >
          <Auth>
            <ListItem sx={{ pt: 0 }}>
              <ListItemText
                primaryTypographyProps={{ noWrap: true }}
                primary={
                  <>
                    Signed in as <strong>{session?.user?.name}</strong>
                  </>
                }
              />
            </ListItem>
            <Divider sx={{ mb: 1 }} />
            <MenuItem onClick={() => signOut()}>Sign out</MenuItem>
          </Auth>
          <Auth exact="Guest">
            <MenuItem onClick={() => signIn()}>Sign in</MenuItem>
          </Auth>
        </MenuOn>
      </Box>
    </Stack>
  );
}
