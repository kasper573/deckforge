import { useForm as useRHF } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod/dist/zod";
import type { z, ZodType } from "zod";
import { useCallback } from "react";
import get from "lodash.get";

/**
 * zod + tRPC + mui specific composition of react-hook-form
 */
export function useForm<T extends ZodType>(schema: T) {
  const form = useRHF<z.infer<T>>({ resolver: zodResolver(schema) });
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = form;

  const trpcHandleSubmit = useCallback(
    (callback: (data: z.infer<T>) => void) => handleSubmit(callback),
    [handleSubmit]
  );

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
    handleSubmit: trpcHandleSubmit,
    register: muiRegister,
  };
}
