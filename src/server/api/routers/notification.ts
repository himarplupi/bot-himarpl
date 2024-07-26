import { arrayContains, inArray, not, type SQL, sql } from "drizzle-orm";
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
    .input(z.object({ slug: z.string(), chatIds: z.array(z.number()).min(1) }))
    .mutation(async ({ ctx, input }) => {
      const prev = await ctx.db.query.notifications.findMany({
        where: (notification) => inArray(notification.chatId, input.chatIds),
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

      // Update many rows at once
      const sqlChunks: SQL[] = [];

      sqlChunks.push(sql`(case`);

      for (const currentChatId of input.chatIds) {
        const currentNotif = [...prev, input.slug];
        sqlChunks.push(
          sql`when ${notifications.chatId} = ${currentChatId} then ${currentNotif}`,
        );
      }

      sqlChunks.push(sql`end)`);

      const finalSql = sql.join(sqlChunks, sql.raw(" "));

      return await ctx.db
        .update(notifications)
        .set({ notifying: finalSql })
        .where(inArray(notifications.chatId, input.chatIds));
    }),
  removeNotify: publicProcedure
    .input(z.object({ slug: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const prevNotif = await ctx.db.query.notifications.findMany({
        columns: {
          chatId: true,
          notifying: true,
        },
      });

      if (!prevNotif) {
        return new TRPCError({
          code: "NOT_FOUND",
          message: "Notification not found",
        });
      }

      // Update many rows at once
      const sqlChunks: SQL[] = [];
      const ids: number[] = [];

      sqlChunks.push(sql`(case`);

      for (const currentNotif of prevNotif) {
        const currentNotifying = currentNotif.notifying.filter(
          (slug) => slug !== input.slug,
        );
        sqlChunks.push(
          sql`when ${notifications.chatId} = ${currentNotif.chatId} then ${currentNotifying}`,
        );
        ids.push(currentNotif.chatId);
      }

      sqlChunks.push(sql`end)`);

      const finalSql = sql.join(sqlChunks, sql.raw(" "));

      return await ctx.db
        .update(notifications)
        .set({ notifying: finalSql })
        .where(inArray(notifications.chatId, ids));
    }),
});
