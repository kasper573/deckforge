import type { TRPCClientError } from "@trpc/client";
import type { ApiRouter } from "../../router";

export const badTokenMessage = "BAD_AUTH_TOKEN" as const;

export function isBadTokenError(err: TRPCClientError<ApiRouter>) {
  return err.data?.code === "UNAUTHORIZED" && err.message === badTokenMessage;
}
