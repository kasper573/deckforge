import { t } from "../trpc/trpc";
import { access } from "../middlewares/access";

export const authRouter = t.router({
  getSession: t.procedure.query(({ ctx }) => {
    return ctx.session;
  }),
  getSecretMessage: t.procedure.use(access()).query(() => {
    return "You are logged in and can see this secret message!";
  }),
});
