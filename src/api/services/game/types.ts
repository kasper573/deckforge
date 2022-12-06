import { z } from "zod";

export const gameType = z.object({
  gameId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  name: z.string().min(1).max(32),
  ownerId: z.string(),
});
