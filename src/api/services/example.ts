import { z } from "zod";
import { access } from "../middlewares/access";
import { t } from "../trpc";

export const exampleRouter = t.router({
  hello: t.procedure
    .input(z.object({ text: z.string().nullish() }).nullish())
    .query(({ input }) => {
      return {
        greeting: `Hello ${input?.text ?? "world"}`,
      };
    }),
  getAll: t.procedure.use(access()).query(({ ctx }) => {
    return ctx.db.example.findMany();
  }),
});
