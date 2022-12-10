import type { User } from "@prisma/client";
import { t } from "../../trpc";
import { UserFacingError } from "../../utils/UserFacingError";
import { access } from "../../middlewares/access";
import {
  getUniqueConflictingFieldName,
  isUniqueConstraintError,
} from "../../utils/isUniqueConstraintError";
import type { JWTUser } from "./types";
import {
  loginPayloadType,
  loginSuccessType,
  updateProfilePayloadType,
  registerUserPayloadType,
  userProfileType,
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
      .input(registerUserPayloadType)
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
          const fieldName = getUniqueConflictingFieldName<User>(e);
          if (fieldName) {
            throw new UserFacingError(`This ${fieldName} is already taken`);
          } else if (isUniqueConstraintError(e)) {
            throw new UserFacingError(
              "This email or username is already taken"
            );
          }
          throw e;
        }
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
          userId: user.userId,
          access: user.accessLevel,
          name: user.name,
        };

        return {
          success: true,
          token: sign(jwtUser),
          user: jwtUser,
        };
      }),
    profile: t.procedure
      .use(access())
      .output(userProfileType)
      .query(({ ctx }) =>
        ctx.db.user.findFirstOrThrow({
          where: { userId: ctx.user.userId },
        })
      ),
    updateProfile: t.procedure
      .input(updateProfilePayloadType)
      .use(access())
      .mutation(async ({ input, ctx: { db, user } }) => {
        let data: Partial<User> = { email: input.email };
        if (input.password) {
          data = {
            ...data,
            passwordHash: await createPasswordHash(input.password),
          };
        }
        return db.user.update({ where: { userId: user.userId }, data });
      }),
  });
}
