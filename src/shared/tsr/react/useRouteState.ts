import type { Dispatch, SetStateAction } from "react";
import { useContext, useEffect, useRef } from "react";
import type { InputRouteParams, RouteDefinition, RouteParams } from "../types";
import type { Route } from "../Route";
import { normalizeLocation } from "../utils/normalizeLocation";
import { RouterContext } from "./RouterContext";
import { useRouteParams } from "./useRouteParams";

export function useRouteState<
  Def extends RouteDefinition,
  ParamName extends keyof RouteParams<Def>
>(route: Route<Def>, paramName: ParamName) {
  const isMounted = useIsMounted();
  const { history, router } = useContext(RouterContext);
  const renderedParams = useRouteParams(route);

  type Params = InputRouteParams<Def["params"]>;
  type ParamValue = RouteParams<Def>[ParamName];
  const setParamValue: Dispatch<SetStateAction<ParamValue>> = (valueOrFn) => {
    if (!isMounted.current) {
      console.warn("Tried to set route state after component unmounted");
      return;
    }

    const currentLocation = normalizeLocation(history.location);
    const currentMatch = router?.match(currentLocation);
    const currentParams =
      currentMatch?.route === route
        ? (currentMatch.params as Params)
        : undefined;

    const currentValue = currentParams?.[paramName];
    const nextValue: ParamValue =
      typeof valueOrFn === "function"
        ? (valueOrFn as (prev?: ParamValue) => ParamValue)(currentValue)
        : valueOrFn;

    const newLocation = route({
      ...currentParams,
      [paramName]: nextValue,
    } as Params);

    if (newLocation !== currentLocation) {
      history.replace(newLocation);
    }
  };

  const paramValue = renderedParams?.[paramName];
  return [paramValue, setParamValue] as const;
}

function useIsMounted() {
  const ref = useRef(false);
  useEffect(() => {
    ref.current = true;
    return () => {
      ref.current = false;
    };
  }, []);
  return ref;
}
