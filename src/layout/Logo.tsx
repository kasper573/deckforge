import type { ComponentProps } from "react";
import Link from "../components/Link";

export function Logo({
  children,
  to = "/",
  ...props
}: Partial<ComponentProps<typeof Link>>) {
  return (
    <Link
      role="heading"
      variant="h6"
      noWrap
      sx={{
        color: "inherit",
        textDecoration: "none",
      }}
      to={to}
      {...props}
    >
      {children}
    </Link>
  );
}
