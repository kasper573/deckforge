import * as React from "react";
import clsx from "clsx";
import { useRouter } from "next/router";
import type { LinkProps as NextLinkProps } from "next/link";
import NextLink from "next/link";
import type { LinkProps as MuiLinkProps } from "@mui/material/Link";
import MuiLink from "@mui/material/Link";
import { styled } from "@mui/material/styles";
import type { TypeSafePage } from "next-type-safe-routes";
import { getRoute } from "next-type-safe-routes";

const Anchor = styled("a")({});

interface NextLinkComposedProps
  extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href">,
    Omit<
      NextLinkProps,
      "href" | "as" | "onClick" | "onMouseEnter" | "onTouchStart"
    > {
  href: NextLinkProps["href"];
  linkAs?: NextLinkProps["as"];
}

export const NextLinkComposed = React.forwardRef<
  HTMLAnchorElement,
  NextLinkComposedProps
>(function NextLinkComposed(props, ref) {
  const {
    href,
    linkAs,
    replace,
    scroll,
    shallow,
    prefetch,
    legacyBehavior = true,
    locale,
    ...other
  } = props;

  return (
    <NextLink
      href={href}
      prefetch={prefetch}
      as={linkAs}
      replace={replace}
      scroll={scroll}
      shallow={shallow}
      passHref
      locale={locale}
      legacyBehavior={legacyBehavior}
    >
      <Anchor ref={ref} {...other} />
    </NextLink>
  );
});

export type LinkProps = {
  activeClassName?: string;
  activeExact?: boolean;
  as?: NextLinkProps["as"];
  to: TypeSafePage;
  linkAs?: NextLinkProps["as"]; // Useful when the as prop is shallow by styled().
  noLinkStyle?: boolean;
} & Omit<NextLinkComposedProps, "linkAs" | "href"> &
  Omit<MuiLinkProps, "href">;

// A styled version of the Next.js Link component:
// https://nextjs.org/docs/api-reference/next/link
const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  props,
  ref
) {
  const {
    activeClassName = "active",
    activeExact = false,
    as,
    className: inputClassName,
    to,
    legacyBehavior,
    linkAs: linkAsProp,
    locale,
    noLinkStyle,
    prefetch,
    replace,
    role, // Link don't have roles.
    scroll,
    shallow,
    ...other
  } = props;

  // When composing Link with other components, sometimes those components might send in an href prop that
  // typescript would not be able to detect, in which case we would get a runtime error, so we delete it to make sure that doesn't happen.
  // Example: <WillPassInHref component={Link} to="/foo" />
  if ("href" in other) {
    delete other["href"];
  }

  const router = useRouter();
  const pathname = getRoute(to);
  const className = clsx(inputClassName, {
    [activeClassName]:
      isActive(router.asPath, pathname, activeExact) && activeClassName,
  });

  const isExternal =
    typeof to === "string" &&
    (to.indexOf("http") === 0 || to.indexOf("mailto:") === 0);

  if (isExternal) {
    if (noLinkStyle) {
      return <Anchor className={className} href={to} ref={ref} {...other} />;
    }

    return <MuiLink className={className} href={to} ref={ref} {...other} />;
  }

  const linkAs = linkAsProp || as;
  const nextJsProps = {
    href: pathname,
    linkAs,
    replace,
    scroll,
    shallow,
    prefetch,
    legacyBehavior,
    locale,
  };

  if (noLinkStyle) {
    return (
      <NextLinkComposed
        className={className}
        ref={ref}
        {...nextJsProps}
        {...other}
      />
    );
  }

  return (
    <MuiLink
      component={NextLinkComposed}
      className={className}
      ref={ref}
      {...nextJsProps}
      {...other}
    />
  );
});

function isActive(
  routerPathname: string,
  linkPathname: string,
  exact: boolean
) {
  if (exact) {
    return routerPathname === linkPathname;
  }

  const index = routerPathname.indexOf(linkPathname);
  return index === 0;
}

export default Link;
