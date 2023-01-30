import type { IconButtonProps } from "@mui/material/IconButton";
import IconButton from "@mui/material/IconButton";
import AccountCircle from "@mui/icons-material/AccountCircle";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import MenuItem from "@mui/material/MenuItem";
import { useAuth } from "../auth/store";
import { MenuFor } from "../../components/MenuFor";
import { OnlineBadge } from "../../components/OnlineBadge";
import { Auth } from "../auth/Auth";
import { LinkMenuItem } from "../../components/Link";
import { router } from "../../router";

export function UserMenu(props?: IconButtonProps) {
  const { user, isAuthenticated, logout } = useAuth();
  return (
    <MenuFor
      MenuListProps={{ "aria-label": "User menu" }}
      trigger={({ open }) => (
        <IconButton
          {...props}
          aria-label="show user menu"
          sx={{ ml: 1 }}
          onClick={open}
        >
          <OnlineBadge
            invisible={!isAuthenticated}
            data-testid="online-indicator"
          >
            <AccountCircle />
          </OnlineBadge>
        </IconButton>
      )}
    >
      <Auth exact="Guest">
        <LinkMenuItem to={router.user().login()}>Sign in</LinkMenuItem>
        <LinkMenuItem to={router.user().register()}>Register</LinkMenuItem>
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
        <LinkMenuItem to={router.editor({})}>Your games</LinkMenuItem>
        <LinkMenuItem to={router.user().profile()}>
          Account settings
        </LinkMenuItem>
        <MenuItem onClick={() => logout()}>Sign out</MenuItem>
      </Auth>
    </MenuFor>
  );
}
