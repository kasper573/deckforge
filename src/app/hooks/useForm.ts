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
import { ZodString } from "zod";
import type { ApiRouter } from "../../api/router";
import { zodTypeAtPath } from "../../lib/zod-extensions/zodTypeAtPath";
import { normalizeType } from "../../lib/zod-extensions/zodNormalize";

/**
 * zod + tRPC + mui specific composition of react-hook-form
 */
export function useForm<T extends ZodType>(
  schema: T,
  formOptions: { defaultValues?: z.infer<T> } = {}
) {
  const form = useRHF<z.infer<T>>({
    resolver: zodResolver(schema),
    ...formOptions,
  });
  const {
    register,
    formState: { errors },
  } = form;

  const useMutation = <Response>(
    mutation: AnyFormMutation<z.infer<T>, Response>,
    options?: UseFormMutationOptions<z.infer<T>, Response>
  ) => useFormMutation(form, mutation, options);

  const muiRegister: typeof register = useCallback(
    (path, fieldOptions) => {
      const error = get(errors, path);
      const fieldType = zodTypeAtPath(schema, path);
      if (!fieldType) {
        throw new Error(`Schema does not contain a field on path "${path}"`);
      }

      const rhfProps = register(path, {
        setValueAs: createFieldValueSetter(fieldType),
        ...fieldOptions,
      });

      const muiProps = {
        error: error !== undefined,
        helperText: error?.message,
      };

      return { ...rhfProps, ...muiProps };
    },
    [schema, errors, register]
  );

  return {
    ...form,
    useMutation,
    register: muiRegister,
  };
}

function createFieldValueSetter<T extends ZodType>(fieldType: T) {
  const emptyTextShouldBecomeUndefined =
    fieldType.isOptional() && normalizeType(fieldType) instanceof ZodString;
  if (emptyTextShouldBecomeUndefined) {
    return (text: string) => (text ? text : undefined);
  }
}

interface UseFormMutationOptions<Payload, Response> {
  onSubmit?: (payload: Payload) => void;
  onSuccess?: (response: Response, payload: Payload) => void;
  onError?: (error: TRPCClientErrorLike<ApiRouter>) => void;
}

function useFormMutation<Payload extends FieldValues, Response>(
  form: UseFormReturn<Payload>,
  mutation: AnyFormMutation<Payload, Response>,
  options?: UseFormMutationOptions<Payload, Response>
) {
  const submit = form.handleSubmit(async (payload) => {
    try {
      options?.onSubmit?.(payload);
      const response = await mutation.mutateAsync(payload);
      options?.onSuccess?.(response, payload);
    } catch (error) {
      if (error instanceof TRPCClientError) {
        setFieldErrors(form, error);
        options?.onError?.(error);
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
  if (!error.data?.zodError) {
    return;
  }
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

function generalMutationError(mutation: AnyFormMutation) {
  return mutation.error && !mutation.error.data?.zodError
    ? mutation.error.message
    : undefined;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyFormMutation<Payload = any, Response = any> = UseTRPCMutationResult<
  Response,
  TRPCClientErrorLike<ApiRouter>,
  Payload,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  any
>;
