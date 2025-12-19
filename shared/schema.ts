import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const dataPoints = pgTable("data_points", {
  id: serial("id").primaryKey(),
  category: text("category").notNull(),
  value: integer("value").notNull(),
  label: text("label").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertDataPointSchema = createInsertSchema(dataPoints).omit({ id: true, createdAt: true });

export type DataPoint = typeof dataPoints.$inferSelect;
export type InsertDataPoint = z.infer<typeof insertDataPointSchema>;
