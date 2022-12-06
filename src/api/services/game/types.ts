import { z } from "zod";

export const gameType = z.object({
  gameId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  name: z.string(),
  ownerId: z.string(),
});
