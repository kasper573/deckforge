import { TRPCClientError } from "@trpc/client";
import type { inferProcedureOutput } from "@trpc/server";
import { useModal } from "../../lib/useModal";
import { Toast } from "../components/Toast";
import type { ApiRouter } from "../../api/router";

interface UseToastMutationOptions<Response> {
  success?: (response: Response) => string | undefined;
  error?: (error: TRPCClientError<ApiRouter>) => string | undefined;
}

type ReactMutationProcedureLike<Input, Response> = {
  useMutation: () => { mutateAsync: (input: Input) => Promise<Response> };
};

export function useToastProcedure<Input, Response>(
  procedure: ReactMutationProcedureLike<Input, Response>,
  options?: UseToastMutationOptions<inferProcedureOutput<Response>>
) {
  const { mutateAsync } = procedure.useMutation();
  return useToastMutation<Input, Response>(mutateAsync, options);
}

export function useToastMutation<Input, Response>(
  mutate: (input: Input) => Promise<Response>,
  {
    success = defaultSuccessParser,
    error = defaultErrorParser,
  }: UseToastMutationOptions<Response> = {}
) {
  const showToast = useModal(Toast);
  return async function mutateAsyncWithToastUI(input: Input) {
    try {
      const response = await mutate(input);
      const message = success?.(response);
      if (message !== undefined) {
        showToast({ variant: "success", content: message });
      }
      return response;
    } catch (e) {
      if (e instanceof TRPCClientError) {
        const message = error?.(e);
        if (message !== undefined) {
          showToast({ variant: "error", content: message });
        }
      }
    }
  };
}

const defaultSuccessParser = (response: unknown) =>
  typeof response === "string" ? response : undefined;

const defaultErrorParser = (response: TRPCClientError<ApiRouter>) =>
  response.message;
