import { pgTable, text, serial, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  zone: text("zone").notNull(),
  chainNo: text("chain_no").notNull(),
  splicingTeam: text("splicing_team").notNull(),
  name: text("name").notNull(),
  jobId: text("job_id").notNull(),
  date: text("date").notNull(),
  timeBegin: text("time_begin").notNull(),
  timeFinished: text("time_finished").notNull(),
  status: boolean("status").notNull(), // true = Complete, false = Not Complete
  effect: text("effect").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertReportSchema = createInsertSchema(reports).omit({ id: true, createdAt: true });

export type Report = typeof reports.$inferSelect;
export type InsertReport = z.infer<typeof insertReportSchema>;
