import { type DefaultSession } from "next-auth";
import { type User as PrismaUser } from "@prisma/client";

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user?: Pick<PrismaUser, "id" | "role"> & DefaultSession["user"];
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface User extends PrismaUser {}
}
