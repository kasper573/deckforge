import { z } from "zod";
import { t } from "../trpc/trpc";
import { isAuthed } from "../middlewares/isAuthed";

export const exampleRouter = t.router({
  hello: t.procedure
    .input(z.object({ text: z.string().nullish() }).nullish())
    .query(({ input }) => {
      return {
        greeting: `Hello ${input?.text ?? "world"}`,
      };
    }),
  getAll: t.procedure.use(isAuthed()).query(({ ctx }) => {
    return ctx.prisma.example.findMany();
  }),
});
