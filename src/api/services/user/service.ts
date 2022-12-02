import { t } from "../../trpc";
import {
  loginPayloadType,
  loginResultType,
  userProfileMutationType,
  userRegisterPayloadType,
} from "./types";

export const userService = t.router({
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
      throw new Error("Not implemented");
    }),
});
