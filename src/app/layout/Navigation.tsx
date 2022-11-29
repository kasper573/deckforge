import type { ComponentProps, ReactNode } from "react";
import List from "@mui/material/List";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Construction from "@mui/icons-material/Construction";
import { Play } from "../components/icons";
import type { LinkTo } from "../components/Link";
import { defined } from "../../shared/util/defined";
import { useAuth0 } from "../../shared/auth0/useAuth0";
import { router } from "../router";
import { LinkListItem } from "../components/Link";

export function Navigation({
  onItemSelected,
}: {
  onItemSelected?: () => void;
}) {
  const { user } = useAuth0();
  return (
    <>
      <RouteList
        onClick={onItemSelected}
        routes={defined([
          {
            linkTo: router.play(),
            label: "Play",
            icon: <Play />,
          },
          user && {
            linkTo: router.build(),
            label: "Build",
            icon: <Construction />,
          },
        ])}
      />
    </>
  );
}

interface RouteListProps extends ComponentProps<typeof List> {
  routes: Array<{ icon: ReactNode; label: ReactNode; linkTo: LinkTo }>;
  onItemSelected?: () => void;
}

function RouteList({ routes, onItemSelected, ...props }: RouteListProps) {
  return (
    <List {...props}>
      {routes.map(({ linkTo, icon, label }, index) => (
        <LinkListItem to={linkTo} key={index} onClick={onItemSelected}>
          <ListItemIcon>{icon}</ListItemIcon>
          <ListItemText primary={label} />
        </LinkListItem>
      ))}
    </List>
  );
}
