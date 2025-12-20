import { db } from "./db";
import { reports, type InsertReport, type Report } from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  getReports(): Promise<Report[]>;
  createReport(report: InsertReport): Promise<Report>;
  deleteReport(id: number): Promise<void>;
  completeReport(id: number): Promise<Report>;
  updateReport(id: number, data: Partial<Report>): Promise<Report>;
}

export class DatabaseStorage implements IStorage {
  async getReports(): Promise<Report[]> {
    return await db.select().from(reports).orderBy(reports.id);
  }

  async createReport(report: InsertReport): Promise<Report> {
    const [newReport] = await db.insert(reports).values(report).returning();
    return newReport;
  }

  async deleteReport(id: number): Promise<void> {
    await db.delete(reports).where(eq(reports.id, id));
  }

  async completeReport(id: number): Promise<Report> {
    const now = new Date().toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
    const [updated] = await db
      .update(reports)
      .set({ status: true, timeFinished: now })
      .where(eq(reports.id, id))
      .returning();
    return updated;
  }

  async updateReport(id: number, data: Partial<Report>): Promise<Report> {
    const [updated] = await db
      .update(reports)
      .set(data)
      .where(eq(reports.id, id))
      .returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();
