import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { notifications } from "~/server/db/schema";

export const notificationRouter = createTRPCRouter({
  create: publicProcedure
    .input(
      z.object({
        chatId: z.number(),
        firstName: z.string(),
        lastName: z.string(),
        username: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(notifications).values({
        chatId: input.chatId,
        firstName: input.firstName,
        lastName: input.lastName,
        username: input.username,
      });
    }),
  getMany: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.select().from(notifications);
  }),
});
