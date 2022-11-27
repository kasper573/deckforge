import { createDefaultParamCodec } from "./utils/createDefaultParamCodec";
import type {
  ParamCodec,
  RouteDefinition,
  RouteMap,
  RouteMiddleware,
} from "./types";
import { Router } from "./Router";
import type { Route } from "./Route";
import { createRoute } from "./Route";

const defaultMeta = {};
const defaultSeparator = "/" as const;

export function createTSR<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  RenderResult = any,
  Meta = typeof defaultMeta,
  Separator extends string = typeof defaultSeparator
>({
  codec = createDefaultParamCodec(),
  separator = defaultSeparator as Separator,
  meta = defaultMeta as Meta,
}: {
  codec?: ParamCodec;
  separator?: Separator;
  meta?: Meta;
} = {}) {
  return new TSR<TSRDefinition<RenderResult, Meta, Separator>>({
    codec,
    separator,
    meta,
  });
}

export class TSR<Def extends TSRDefinition> {
  constructor(
    private options: {
      codec: ParamCodec;
      separator: Def["separator"];
      meta: Def["meta"];
    }
  ) {
    this.route = createRoute({
      tsr: {
        codec: this.options.codec,
        separator: this.options.separator,
      } as Def,
      middlewares: [],
      children: {},
      meta: this.options.meta,
      params: {},
      path: "",
    });
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  readonly route: Route<RouteDefinition<Def, "", {}, {}>>;

  router<Graph extends RouteMap<Def>>(graph: Graph) {
    return new Router(this.route.children(graph));
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  middleware(fn: RouteMiddleware<{}, Def["renderResult"]>) {
    return fn;
  }
}

export interface TSRDefinition<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  RenderResult = any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Meta = any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Separator extends string = any
> {
  meta: Meta;
  renderResult: RenderResult;
  codec: ParamCodec;
  separator: Separator;
}
