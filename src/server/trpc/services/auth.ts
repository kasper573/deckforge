import { t } from "../trpc";
import { isAuthed } from "../../middlewares/isAuthed";

export const authRouter = t.router({
  getSession: t.procedure.query(({ ctx }) => {
    return ctx.session;
  }),
  getSecretMessage: t.procedure.use(isAuthed()).query(() => {
    return "You are logged in and can see this secret message!";
  }),
});
