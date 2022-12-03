import type { FieldValues, UseFormReturn } from "react-hook-form";
import { useForm as useRHF } from "react-hook-form";
import type { z, ZodType } from "zod";
import { useCallback } from "react";
import get from "lodash.get";
import type { UseTRPCMutationResult } from "@trpc/react-query/shared";
import type { TRPCClientErrorLike } from "@trpc/client";
import { TRPCClientError } from "@trpc/client";
import type { FieldPath } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ApiRouter } from "../../api/router";

/**
 * zod + tRPC + mui specific composition of react-hook-form
 */
export function useForm<T extends ZodType>(schema: T) {
  const form = useRHF<z.infer<T>>({ resolver: zodResolver(schema) });
  const {
    register,
    formState: { errors },
  } = form;

  const useMutation = (mutation: AnyFormMutation<T>) =>
    useFormMutation(form, mutation);

  const muiRegister: typeof register = useCallback(
    (path, ...rest) => {
      const error = get(errors, path);
      const rhfProps = register(path, ...rest);
      const muiProps = {
        error: error !== undefined,
        helperText: error?.message,
      };
      return { ...rhfProps, ...muiProps };
    },
    [errors, register]
  );

  return {
    ...form,
    useMutation,
    register: muiRegister,
  };
}

function useFormMutation<T extends ZodType>(
  form: UseFormReturn<z.infer<T>>,
  mutation: AnyFormMutation<T>
) {
  const submit = form.handleSubmit(async (data) => {
    try {
      await mutation.mutateAsync(data);
    } catch (error) {
      if (error instanceof TRPCClientError) {
        setFieldErrors(form, error);
      }
    }
  });

  const error = generalMutationError(mutation);

  return { submit, error };
}

function setFieldErrors<Data extends FieldValues>(
  form: UseFormReturn<Data>,
  error: TRPCClientError<ApiRouter>
) {
  if (error.data?.zodError) {
    for (const [path, messages] of Object.entries(
      error.data.zodError.fieldErrors
    )) {
      if (messages && messages.length > 0) {
        form.setError(path as FieldPath<Data>, {
          message: messages.join(", "),
        });
      }
    }
  }
}

function generalMutationError(mutation: AnyFormMutation) {
  return mutation.error && !mutation.error.data?.zodError
    ? mutation.error.message
    : undefined;
}

type AnyFormMutation<T extends ZodType = ZodType> = UseTRPCMutationResult<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  any,
  TRPCClientErrorLike<ApiRouter>,
  z.infer<T>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  any
>;
