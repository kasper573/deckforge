import type { InputRouteParams, RouteLocationFactory } from "./types";
import type { Route } from "./Route";

export function createConvenienceRoute<R extends Route>(
  route: R
): ConvenienceRoute<R> {
  const functor = (params: InputRouteParams<R["def"]["params"]>) =>
    route(params);

  functor.$ = route;

  for (const [k, v] of Object.entries(route.def.children)) {
    (functor as any)[k] = createConvenienceRoute(v as Route);
  }

  return functor as ConvenienceRoute<R>;
}

export type ConvenienceRoute<R extends Route> = Readonly<{
  [K in keyof R["def"]["children"]]: ConvenienceRoute<R["def"]["children"][K]>;
}> &
  RouteLocationFactory<R["def"]["params"]> & {
    readonly $: R;
  };
