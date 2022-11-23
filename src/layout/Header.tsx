import Breadcrumbs from "@mui/material/Breadcrumbs";
import Stack from "@mui/material/Stack";
import type { ComponentProps, ReactNode } from "react";
import { useRouter } from "next/router";
import useTheme from "@mui/material/styles/useTheme";

export function Header<Arg>({
  title,
  children,
  breadcrumbs = true,
  sx,
  ...props
}: {
  title?: ReactNode;
  breadcrumbs?: boolean;
} & Omit<ComponentProps<typeof Breadcrumbs>, "title">) {
  const theme = useTheme();
  const router = useRouter();

  if (!title) {
    title = router.route;
  }

  return (
    <Stack direction="row" alignItems="center">
      <Breadcrumbs
        role="heading"
        sx={{ height: 24, mb: 2, ...theme.typography.h6, ...sx }}
        {...props}
      >
        {title && (
          <Stack direction="row" alignItems="center">
            {title}
          </Stack>
        )}
      </Breadcrumbs>
      {children}
    </Stack>
  );
}
