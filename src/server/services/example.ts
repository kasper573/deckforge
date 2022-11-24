import { z } from "zod";
import { t } from "../trpc/trpc";
import { access } from "../middlewares/access";

export const exampleRouter = t.router({
  hello: t.procedure
    .input(z.object({ text: z.string().nullish() }).nullish())
    .query(({ input }) => {
      return {
        greeting: `Hello ${input?.text ?? "world"}`,
      };
    }),
  getAll: t.procedure.use(access()).query(({ ctx }) => {
    return ctx.prisma.example.findMany();
  }),
});
