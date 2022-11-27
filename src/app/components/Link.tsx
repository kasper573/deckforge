import MuiLink from "@mui/material/Link";
import type { ComponentProps } from "react";
import { forwardRef } from "react";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import ListItemButton from "@mui/material/ListItemButton";
import MenuItem from "@mui/material/MenuItem";
import { Link as RouterLink, useLocation } from "react-router-dom";
import * as React from "react";

export interface LinkTo {
  $: string;
}

type AdditionalLinkProps = Pick<TypesafeRouterLinkProps, "to">;

type TypesafeRouterLinkProps = Omit<ComponentProps<typeof RouterLink>, "to"> & {
  to: LinkTo;
};

const TypesafeRouterLink = forwardRef<
  HTMLAnchorElement,
  TypesafeRouterLinkProps
>(function TypesafeRouterLink({ to, role, ...props }, ref) {
  return <RouterLink ref={ref} to={to.$} {...props} role={role} />;
});

export function Link(
  props: ComponentProps<typeof MuiLink> & AdditionalLinkProps
) {
  return <MuiLink component={TypesafeRouterLink} {...props} />;
}

export function LinkButton(
  props: ComponentProps<typeof Button> & AdditionalLinkProps
) {
  return (
    <Button
      component={TypesafeRouterLink}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      {...(props as any)}
      role={undefined}
    />
  );
}

export function LinkIconButton(
  props: ComponentProps<typeof IconButton> & AdditionalLinkProps
) {
  return (
    <IconButton
      component={TypesafeRouterLink}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      {...(props as any)}
      role={undefined}
    />
  );
}

export function LinkListItem(
  props: ComponentProps<typeof ListItemButton> & AdditionalLinkProps
) {
  return (
    <ListItemButton
      component={TypesafeRouterLink}
      selected={useIsActive(props.to)}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      {...(props as any)}
      role={undefined}
    />
  );
}

export function LinkMenuItem(
  props: ComponentProps<typeof MenuItem> & AdditionalLinkProps
) {
  return (
    <MenuItem
      component={TypesafeRouterLink}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      {...(props as any)}
    />
  );
}

function useIsActive(to: LinkTo) {
  const location = useLocation();
  return location.pathname.startsWith(to.$);
}
