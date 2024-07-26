import { arrayContains, eq, not } from "drizzle-orm";
import { z } from "zod";

import { TRPCError } from "@trpc/server";

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
      return await ctx.db.insert(notifications).values({
        chatId: input.chatId,
        firstName: input.firstName,
        lastName: input.lastName,
        username: input.username,
      });
    }),
  getMany: publicProcedure.query(async ({ ctx }) => {
    return await ctx.db.select().from(notifications);
  }),
  getUnnotify: publicProcedure
    .input(z.object({ slug: z.string(), limit: z.number().default(25) }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.query.notifications.findMany({
        limit: input.limit,
        where: (notification) =>
          not(arrayContains(notification.notifying, [input.slug])),
      });
    }),
  notify: publicProcedure
    .input(z.object({ slug: z.string(), chatId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const prev = await ctx.db.query.notifications.findFirst({
        where: (notification) => eq(notification.chatId, input.chatId),
        columns: {
          notifying: true,
        },
      });

      if (!prev) {
        return new TRPCError({
          code: "NOT_FOUND",
          message: "Notification not found",
        });
      }

      return await ctx.db
        .update(notifications)
        .set({
          notifying: [...prev.notifying, input.slug],
        })
        .where(eq(notifications.chatId, input.chatId));
    }),
  removeNotify: publicProcedure
    .input(z.object({ slug: z.string(), chatId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const prev = await ctx.db.query.notifications.findFirst({
        where: (notification) => eq(notification.chatId, input.chatId),
        columns: {
          notifying: true,
        },
      });

      if (!prev) {
        return new TRPCError({
          code: "NOT_FOUND",
          message: "Notification not found",
        });
      }

      const newNotifying = prev.notifying.filter((slug) => slug !== input.slug);

      return await ctx.db
        .update(notifications)
        .set({
          notifying: newNotifying,
        })
        .where(eq(notifications.chatId, input.chatId));
    }),
});
