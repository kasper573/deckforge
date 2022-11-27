import type { ReactElement } from "react";
import type { TSRDefinition } from "../tsr";
import type { AnyRouteLike, RouteRendererProps } from "../types";
import type { Router } from "../Router";

export type ReactRenderResult = ReactElement | null;

export type ReactRouter = Router<
  AnyRouteLike<TSRDefinition<ReactRenderResult>>
>;

export type RouteComponentProps<Params> = RouteRendererProps<
  Params,
  ReactRenderResult
>;
