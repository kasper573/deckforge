import type { Location } from "history";
import type { RouteLocation } from "../types";

export function normalizeLocation(location: Location): RouteLocation {
  return (location.pathname + location.search) as RouteLocation;
}
