import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const ebooks = sqliteTable("ebooks", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  authors: text("authors").notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
  location: text("location").notNull(),
  currentText: text("current_text").notNull(),
});
