import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import type { ComponentProps, ReactNode } from "react";
import List from "@mui/material/List";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import type { TypeSafePage } from "next-type-safe-routes";
import { useSession } from "next-auth/react";
import Construction from "@mui/icons-material/Construction";
import ListItemButton from "@mui/material/ListItemButton";
import { Play } from "../components/icons";
import { defined } from "../shared/util/defined";
import Link from "../components/Link";

export function Menu({ onItemSelected }: { onItemSelected?: () => void }) {
  const { data: session } = useSession();
  return (
    <>
      <Typography id="main-menu" sx={{ pl: 2 }}>
        Main menu
      </Typography>
      <Divider />
      <RouteList
        aria-labelledby="main-menu"
        onClick={onItemSelected}
        routes={defined([
          {
            linkTo: { route: "/play/[gameId]", params: { gameId: "foo" } },
            label: "Play",
            icon: <Play />,
          },
          session?.user && {
            linkTo: "/build",
            label: "Build",
            icon: <Construction />,
          },
        ])}
      />
    </>
  );
}

interface RouteListProps extends ComponentProps<typeof List> {
  routes: Array<{ icon: ReactNode; label: ReactNode; linkTo: TypeSafePage }>;
  onItemSelected?: () => void;
}

function RouteList({ routes, onItemSelected, ...props }: RouteListProps) {
  return (
    <List role="menu" {...props}>
      {routes.map(({ linkTo, icon, label }, index) => (
        <ListItemButton
          component={Link}
          activeClassName="Mui-selected"
          activeExact
          to={linkTo}
          key={index}
          onClick={onItemSelected}
        >
          <ListItemIcon>{icon}</ListItemIcon>
          <ListItemText primary={label} />
        </ListItemButton>
      ))}
    </List>
  );
}
