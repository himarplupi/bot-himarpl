// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { sql } from "drizzle-orm";
import {
  bigserial,
  index,
  pgTableCreator,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `bot-himarpl_${name}`);

export const notifications = createTable(
  "notification",
  {
    chatId: bigserial("chat_id", { mode: "number" }).primaryKey(),
    firstName: varchar("first_name", { length: 256 }),
    lastName: varchar("last_name", { length: 256 }),
    username: varchar("username", { length: 256 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    notifying: text("notifying")
      .array()
      .notNull()
      .default(sql`ARRAY[]::text[]`),
  },
  (notifications) => ({
    chatIdIndex: index("chat_id_idx").on(notifications.chatId),
  }),
);
