import { db } from "./db";
import { reports, type InsertReport, type Report } from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  getReports(): Promise<Report[]>;
  createReport(report: InsertReport): Promise<Report>;
  deleteReport(id: number): Promise<void>;
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
}

export const storage = new DatabaseStorage();
