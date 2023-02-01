import { TRPCClientError } from "@trpc/client";
import type { ReactNode } from "react";
import { useModal } from "../../lib/useModal";
import { Toast } from "../components/Toast";
import type { ApiRouter } from "../../api/router";
import type { AnyFormMutation } from "./useForm";

export interface UseToastMutationOptions<Response> {
  toastParsers?: ToastResponseParsers<Response>;
}

export interface ToastResponseParsers<Response> {
  success?: (response: Response) => ReactNode | undefined | void;
  error?: (error: TRPCClientError<ApiRouter>) => ReactNode | undefined | void;
}

type ReactMutationProcedureLike<Input, Response, ProcedureOptions> = {
  useMutation: (options?: ProcedureOptions) => AnyFormMutation<Input, Response>;
};

export function useToastProcedure<Input, Response, ProcedureOptions>(
  procedure: ReactMutationProcedureLike<Input, Response, ProcedureOptions>,
  options?: ProcedureOptions & UseToastMutationOptions<Response>
) {
  const { mutateAsync, mutate, ...rest } = procedure.useMutation(options);
  const mutateAsyncWithToast = useToastMutation<Input, Response>(
    mutateAsync,
    options?.toastParsers
  );
  return {
    ...rest,
    mutateAsync: mutateAsyncWithToast as typeof mutateAsync,
    mutate: mutateAsyncWithToast as typeof mutate,
  };
}

export function useToastMutation<Input, Response>(
  mutate: (input: Input) => Promise<Response>,
  {
    success = defaultSuccessParser,
    error = defaultErrorParser,
  }: ToastResponseParsers<Response> = {}
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
      throw e;
    }
  };
}

const defaultSuccessParser = (response: unknown) =>
  typeof response === "string" ? response : undefined;

const defaultErrorParser = (response: TRPCClientError<ApiRouter>) => {
  if (response.data?.zodError) {
    return (
      <>
        {response.data.zodError.formErrors.map((message, index) => (
          <div key={`form-error-${index}`}>{message}</div>
        ))}
        {Object.entries(response.data.zodError.fieldErrors).map(
          ([path, messages = []]) => (
            <div key={path}>
              {path}: {messages.join(", ")}
            </div>
          )
        )}
      </>
    );
  }
  return response.message;
};
