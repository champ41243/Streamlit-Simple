import { pgTable, text, serial, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  zone: text("zone").notNull(),
  chainNo: text("chain_no").notNull(),
  splicingTeam: text("splicing_team").notNull(),
  name: text("name").notNull(),
  phoneNumber: text("phone_number"),
  jobId: text("job_id").notNull(),
  bjOrSite: text("bj_or_site").notNull(),
  routing: text("routing").notNull(),
  date: text("date").notNull(),
  gpsCoordinates: text("gps_coordinates"),
  timeBegin: text("time_begin"),
  timeFinished: text("time_finished"),
  status: boolean("status").notNull(), // true = Complete, false = Not Complete
  effect: text("effect").notNull(),
  problemDetails: text("problem_details"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertReportSchema = createInsertSchema(reports)
  .omit({ id: true, createdAt: true, timeBegin: true, timeFinished: true })
  .extend({
    timeBegin: z.string().optional(),
    gpsCoordinates: z.string().optional(),
    problemDetails: z.string().optional(),
  });

export const updateReportSchema = z.object({
  zone: z.string().optional(),
  chainNo: z.string().optional(),
  splicingTeam: z.string().optional(),
  name: z.string().optional(),
  jobId: z.string().optional(),
  bjOrSite: z.string().optional(),
  routing: z.string().optional(),
  date: z.string().optional(),
  gpsCoordinates: z.string().optional(),
  timeBegin: z.string().optional(),
  timeFinished: z.string().optional(),
  status: z.boolean().optional(),
  effect: z.string().optional(),
  problemDetails: z.string().optional(),
});

export type Report = typeof reports.$inferSelect;
export type InsertReport = z.infer<typeof insertReportSchema>;
