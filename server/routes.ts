import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { updateReportSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.get(api.reports.list.path, async (req, res) => {
    const data = await storage.getReports();
    res.json(data);
  });

  app.post(api.reports.create.path, async (req, res) => {
    try {
      const input = api.reports.create.input.parse(req.body);
      const report = await storage.createReport(input);
      res.status(201).json(report);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.delete(api.reports.delete.path, async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }
    await storage.deleteReport(id);
    res.status(204).send();
  });

  app.patch("/api/reports/:id/complete", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }
    const report = await storage.completeReport(id);
    res.json(report);
  });

  app.patch(api.reports.update.path, async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }
    try {
      const input = updateReportSchema.parse(req.body);
      const report = await storage.updateReport(id, input);
      res.json(report);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  // Seed data (wrapped in try-catch for first run)
  seedDatabase().catch(err => {
    console.log("Seed will run after schema migration:", err.message);
  });

  return httpServer;
}

async function seedDatabase() {
  try {
    const existing = await storage.getReports();
    if (existing.length === 0) {
    const timeBegin1 = "09:15";
    const timeBegin2 = "10:30";
    const timeBegin3 = "14:45";
    const seedData = [
      {
        zone: "SCT",
        chainNo: "CH001",
        splicingTeam: "Team 1",
        name: "John Smith",
        jobId: "JOB-001",
        bjOrSite: "BJ-001",
        routing: "Route-A",
        date: "2025-12-15",
        timeBegin: timeBegin1,
        status: true,
        effect: "Excellent connection quality"
      },
      {
        zone: "CWT",
        chainNo: "CH002",
        splicingTeam: "Team 2",
        name: "Jane Doe",
        jobId: "JOB-002",
        bjOrSite: "Site-B",
        routing: "Route-B",
        date: "2025-12-16",
        timeBegin: timeBegin2,
        status: true,
        effect: "Minor adjustments needed"
      },
      {
        zone: "TWA",
        chainNo: "CH003",
        splicingTeam: "Team 1",
        name: "Mike Johnson",
        jobId: "JOB-003",
        bjOrSite: "BJ-003",
        routing: "Route-C",
        date: "2025-12-17",
        timeBegin: timeBegin3,
        status: false,
        effect: "Pending review"
      },
    ];
    
    for (const item of seedData) {
      await storage.createReport(item);
    }
    console.log("Database seeded with initial report data");
    }
  } catch (err) {
    console.log("Schema not yet created - will seed after migration");
  }
}
