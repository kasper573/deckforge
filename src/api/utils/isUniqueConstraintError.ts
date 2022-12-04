import { Prisma } from "../db";

export function isUniqueConstraintError(
  error: unknown
): error is Prisma.PrismaClientKnownRequestError {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  );
}

export function getUniqueConflictingFieldName<T>(
  prismaError: unknown
): keyof T | undefined {
  if (isUniqueConstraintError(prismaError)) {
    const match = /_(.*)_key$/.exec(`${prismaError.meta?.target}`);
    return match ? (match[1] as keyof T) : undefined;
  }
}
