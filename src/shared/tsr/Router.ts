import type { AnyRouteLike, RouteMatch } from "./types";
import type { ConvenienceRoute } from "./ConvenienceRoute";
import { createConvenienceRoute } from "./ConvenienceRoute";
import type { CascadedRoute } from "./CascadedRoute";
import { createCascadedRoute } from "./CascadedRoute";
import type { Route } from "./Route";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class Router<Root extends Route = any> {
  private readonly flattened: Array<{ route: Route; depth: number }>;
  readonly routes: ConvenienceRoute<CascadedRoute<Root>>;

  match(
    location: string,
    numMirrorsAllowed = 10
  ): RouteMatch<AnyRouteLike<Root>> | undefined {
    const [bestMatch] = this.flattened
      .sort((a, b) => b.depth - a.depth)
      .map(({ route }) => {
        const params = route.parseLocation(location);
        return params ? { route, params } : undefined;
      })
      .filter((match): match is RouteMatch<AnyRouteLike<Root>> => !!match);

    const mirrorTo = bestMatch?.route.def.mirror?.();
    if (mirrorTo === undefined) {
      return bestMatch;
    }

    if (numMirrorsAllowed === 0) {
      throw new Error(
        "Too many mirrored locations, stopped possible endless recursion"
      );
    }

    return this.match(mirrorTo, numMirrorsAllowed - 1);
  }

  constructor(private root: Root) {
    const cascade = createCascadedRoute(this.root, "", {});
    this.flattened = flattenGraph(cascade, false);
    this.routes = createConvenienceRoute(cascade);
  }
}

function flattenGraph<R extends Route>(
  route: R,
  includeSelf = true
): Array<{ route: Route; depth: number }> {
  return [
    ...(includeSelf ? [{ route, depth: 0 }] : []),
    ...Object.values(route.def.children).flatMap((child) =>
      flattenGraph(child as Route).map(({ route, depth }) => ({
        route,
        depth: depth + 1,
      }))
    ),
  ];
}
