import type { LinkProps as MuiLinkProps } from "@mui/material/Link";
import MuiLink from "@mui/material/Link";
import { forwardRef } from "react";

export type LinkTo = unknown;

export interface LinkProps extends Omit<MuiLinkProps, "href"> {
  to: LinkTo;
  activeClassName?: string;
  activeExact?: boolean;
}

export default forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  { to, activeClassName, activeExact, ...rest },
  ref
) {
  return <MuiLink ref={ref} {...rest} />;
});
