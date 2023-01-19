import type {
  AnyProcedure,
  AnyRouter,
  inferProcedureOutput,
  inferProcedureParams,
} from "@trpc/server";
import type { TRPCLink } from "@trpc/react-query";
import { splitLink, TRPCClientError } from "@trpc/react-query";
import { observable } from "@trpc/server/observable";
import type { Operation } from "@trpc/client";
import type { ProcedureRouterRecord } from "@trpc/server/src/core/router";
import type { TRPCResultMessage } from "@trpc/server/rpc";

export function interceptedLink<Router extends AnyRouter>(
  link: TRPCLink<Router>,
  definition?: LinkInterceptorsDefinition<Router>
): TRPCLink<Router> {
  const getInterceptors =
    typeof definition === "function" ? definition : () => definition;

  return splitLink({
    condition: (op) => !!resolve(op, getInterceptors()),
    false: link,
    true:
      () =>
      ({ op }) =>
        observable((observer) => {
          const intercept = resolve(op, getInterceptors());
          if (intercept) {
            const result: TRPCResultMessage<unknown>["result"] = {
              data: intercept(op.input),
              type: "data" as const,
            };
            observer.next({ result });
            observer.complete();
          } else {
            observer.error(
              TRPCClientError.from(
                new Error("No interceptor found for link operation")
              )
            );
          }
        }),
  });
}

function resolve<Router extends AnyRouter>(
  op: Operation,
  interceptors: LinkInterceptors<Router> = {}
): ProcedureInterceptor<AnyProcedure> | undefined {
  const steps = op.path.split(".");
  let record: InterceptorRecord = interceptors;
  while (steps.length) {
    const step = steps.shift();
    const interceptor = record[step as keyof typeof record];
    if (typeof interceptor === "function") {
      return interceptor;
    } else if (interceptor) {
      record = interceptor;
    } else {
      break;
    }
  }
}

export type CreateInterceptedLink = (
  link: TRPCLink<AnyRouter>
) => TRPCLink<AnyRouter>;

export type ProcedureInterceptor<T extends AnyProcedure> = (
  input: inferProcedureParams<T>["_input_out"]
) => inferProcedureOutput<T>;

export type LinkInterceptors<Router extends AnyRouter> = InterceptorRecord<
  Router["_def"]["record"]
>;

export type InterceptorRecord<
  T extends ProcedureRouterRecord = ProcedureRouterRecord
> = {
  [K in keyof T]?: T[K] extends AnyProcedure
    ? ProcedureInterceptor<T[K]>
    : T[K] extends AnyRouter
    ? LinkInterceptors<T[K]>
    : never;
};

export type LinkInterceptorsDefinition<Router extends AnyRouter> =
  | LinkInterceptors<Router>
  | (() => undefined | LinkInterceptors<Router>);
