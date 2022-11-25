import { access } from "../../middlewares/access";
import { t } from "../../trpc";

export const authRouter = t.router({
  getSession: t.procedure.query(({ ctx }) => {
    return ctx.session;
  }),
  getSecretMessage: t.procedure.use(access()).query(() => {
    return "You are logged in and can see this secret message!";
  }),
});
