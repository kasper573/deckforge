import * as ptr from "path-to-regexp";
import type { ZodTypeAny } from "zod";
import type {
  AnyRouteLike,
  InputRouteParams,
  RouteDefinition,
  RouteLocationFactory,
  RouteMap,
  RouteMatchOptions,
  RouteMiddleware,
  RouteParamsTypeFor,
  RouteLocation,
  OutputRouteParams,
  RouteRenderer,
} from "./types";

type EncodedParams = Record<string, string>;

export function createRoute<Def extends RouteDefinition>(
  def: Def,
  parent?: AnyRouteLike<Def>
): Route<Def> {
  const ptrFormat = ptr.compile<EncodedParams>(def.path);

  // Since we want to be able to call a route to create its location, we need to use a functor.
  const functor = (params: InputRouteParams<Def["params"]>) =>
    createLocation(def, ptrFormat, params);

  Object.assign(
    functor,
    new RouteMembers(def, parent),
    getMethods(RouteMembers)
  );

  return functor as Route<Def>;
}

export interface Route<Def extends RouteDefinition = RouteDefinition>
  extends RouteMembers<Def>,
    RouteLocationFactory<Def["params"]> {}

function createLocation<Def extends RouteDefinition>(
  def: Def,
  format: ptr.PathFunction<EncodedParams>,
  params: InputRouteParams<Def["params"]>
) {
  const encoded = Object.entries(def.params).reduce(
    (a, [k, type]) => ({
      ...a,
      [k]: def.tsr.codec.encode(
        params[k as keyof typeof params],
        type as ZodTypeAny
      ),
    }),
    {}
  );
  return format(encoded) as RouteLocation;
}

class RouteMembers<Def extends RouteDefinition> {
  private readonly ptrMatch: ptr.MatchFunction<EncodedParams>;

  constructor(
    public def: Def,
    /*
      Only available when routes are in a router
     */
    public parent: AnyRouteLike<Def> | undefined
  ) {
    this.ptrMatch = ptr.match(this.def.path, {
      end: this.def.matchOptions?.exact ?? false,
      strict: this.def.matchOptions?.strict ?? false,
    });
    this.render = this.def.middlewares.reduce(
      (renderer, next) => next(renderer),
      this.def.renderer ?? passThroughRenderer
    );
  }

  render: RouteRenderer<Def["params"], Def["tsr"]["renderResult"]>;

  parseLocation(
    location: string
  ): OutputRouteParams<Def["params"]> | undefined {
    const encoded = this.ptrMatch(location);
    if (!encoded) {
      return;
    }
    try {
      return Object.entries(encoded.params).reduce(
        (a, [k, v]) => ({
          ...a,
          [k]: this.def.tsr.codec.decode(v, this.def.params[k]),
        }),
        {} as OutputRouteParams<Def["params"]>
      );
    } catch (e) {
      return;
    }
  }

  path<Path extends string>(
    path: Path,
    matchOptions?: RouteMatchOptions
  ): Route<RouteDefinition<Def["tsr"], Path, Def["params"], Def["children"]>> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return createRoute({ ...this.def, path, matchOptions } as any);
  }

  mirror(mirror: Def["mirror"]): Route<Def> {
    return createRoute({ ...this.def, mirror });
  }

  params<ParamsType extends RouteParamsTypeFor<Def["path"]>>(
    params: ParamsType
  ): Route<
    RouteDefinition<Def["tsr"], Def["path"], ParamsType, Def["children"]>
  > {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return createRoute({ ...this.def, params } as any);
  }

  meta(meta: Def["meta"]): Route<Def> {
    return createRoute({ ...this.def, meta });
  }

  renderer(renderer: Def["renderer"]): Route<Def> {
    return createRoute({ ...this.def, renderer });
  }

  use(
    ...additionalMiddlewares: Array<
      RouteMiddleware<Def["params"], Def["tsr"]["renderResult"]>
    >
  ): Route<Def> {
    return createRoute({
      ...this.def,
      middlewares: [...this.def.middlewares, ...additionalMiddlewares],
    });
  }

  children<Children extends RouteMap<Def["tsr"]>>(
    children: Children
  ): Route<RouteDefinition<Def["tsr"], Def["path"], Def["params"], Children>> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return createRoute({ ...this.def, children } as any);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getMethods(clazz: new (...args: any[]) => any) {
  return Object.getOwnPropertyNames(clazz.prototype).reduce(
    (a, prop) => ({
      ...a,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      [prop]: (clazz.prototype as any)[prop],
    }),
    {}
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const passThroughRenderer: RouteRenderer<any, any> = ({ children }) => children;
