import type { UseTRPCQueryResult } from "@trpc/react-query/dist/shared";
import { useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useQueryData<T extends UseTRPCQueryResult<any, any>>(query: T) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  type Data = T extends UseTRPCQueryResult<infer D, any> ? D : never;
  const client = useQueryClient();
  const queryKey = useMemo(() => query.trpc.path.split("."), [query.trpc.path]);

  return {
    set: (data: Data) => client.setQueryData(queryKey, data),
    get: (): Data | undefined => client.getQueryData(queryKey),
  };
}
