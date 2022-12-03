import { Prisma } from "@prisma/client";
import { t } from "../../trpc";
import { UserFacingError } from "../../utils/UserFacingError";
import type { JWTUser } from "./types";
import {
  loginPayloadType,
  loginSuccessType,
  roleToAccessLevel,
  userProfileMutationType,
  userRegisterPayloadType,
} from "./types";
import type { Authenticator } from "./authenticator";

export type UserService = ReturnType<typeof createUserService>;
export function createUserService({
  verifyPassword,
  createPasswordHash,
  sign,
}: Authenticator) {
  return t.router({
    register: t.procedure
      .input(userRegisterPayloadType)
      .mutation(async ({ input, ctx }) => {
        try {
          await ctx.db.user.create({
            data: {
              name: input.name,
              email: input.email,
              passwordHash: await createPasswordHash(input.password),
            },
          });
        } catch (e) {
          if (e instanceof Prisma.PrismaClientKnownRequestError) {
            if (e.code === "P2002") {
              throw new UserFacingError(
                `${
                  e.message.includes("email") ? "Email" : "Username"
                } already in use`
              );
            }
          }
          throw e;
        }
      }),
    updateProfile: t.procedure.input(userProfileMutationType).mutation(() => {
      throw new Error("Not implemented");
    }),
    login: t.procedure
      .input(loginPayloadType)
      .output(loginSuccessType)
      .mutation(async ({ ctx, input: { username, password } }) => {
        const user = await ctx.db.user.findFirst({
          where: { name: username },
        });

        const isValidCredentials =
          user && (await verifyPassword(password, user.passwordHash));

        if (!isValidCredentials) {
          throw new UserFacingError("Invalid username or password");
        }

        const jwtUser: JWTUser = {
          id: user.id,
          access: roleToAccessLevel(user.role),
          name: user.name,
        };

        return {
          success: true,
          token: sign(jwtUser),
          user: jwtUser,
        };
      }),
  });
}
