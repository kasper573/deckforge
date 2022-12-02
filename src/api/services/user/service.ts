import { t } from "../../trpc";
import {
  loginPayloadType,
  loginResultType,
  UserAccessLevel,
  userProfileMutationType,
  userRegisterPayloadType,
} from "./types";
import type { Authenticator } from "./authenticator";

export type UserService = ReturnType<typeof createUserService>;
export function createUserService(authenticator: Authenticator) {
  return t.router({
    register: t.procedure.input(userRegisterPayloadType).mutation(() => {
      throw new Error("Not implemented");
    }),
    updateProfile: t.procedure.input(userProfileMutationType).mutation(() => {
      throw new Error("Not implemented");
    }),
    login: t.procedure
      .input(loginPayloadType)
      .output(loginResultType)
      .mutation(() => {
        const user = {
          id: "fake",
          access: UserAccessLevel.User,
          name: "Fake User",
        };
        return {
          success: true,
          token: authenticator.sign(user),
          user,
        };
      }),
  });
}
