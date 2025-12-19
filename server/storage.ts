import { db } from "./db";
import { dataPoints, type InsertDataPoint, type DataPoint } from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  getDataPoints(): Promise<DataPoint[]>;
  createDataPoint(point: InsertDataPoint): Promise<DataPoint>;
  deleteDataPoint(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getDataPoints(): Promise<DataPoint[]> {
    return await db.select().from(dataPoints).orderBy(dataPoints.id);
  }

  async createDataPoint(point: InsertDataPoint): Promise<DataPoint> {
    const [newItem] = await db.insert(dataPoints).values(point).returning();
    return newItem;
  }

  async deleteDataPoint(id: number): Promise<void> {
    await db.delete(dataPoints).where(eq(dataPoints.id, id));
  }
}

export const storage = new DatabaseStorage();
