import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.get(api.data.list.path, async (req, res) => {
    const data = await storage.getDataPoints();
    res.json(data);
  });

  app.post(api.data.create.path, async (req, res) => {
    try {
      const input = api.data.create.input.parse(req.body);
      const data = await storage.createDataPoint(input);
      res.status(201).json(data);
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

  app.delete(api.data.delete.path, async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }
    await storage.deleteDataPoint(id);
    res.status(204).send();
  });

  // Seed data
  seedDatabase();

  return httpServer;
}

async function seedDatabase() {
  const existing = await storage.getDataPoints();
  if (existing.length === 0) {
    const seedData = [
      { label: "Jan", value: 400, category: "Sales" },
      { label: "Feb", value: 300, category: "Sales" },
      { label: "Mar", value: 200, category: "Sales" },
      { label: "Apr", value: 278, category: "Sales" },
      { label: "May", value: 189, category: "Sales" },
      { label: "Jan", value: 240, category: "Traffic" },
      { label: "Feb", value: 139, category: "Traffic" },
      { label: "Mar", value: 980, category: "Traffic" },
      { label: "Apr", value: 390, category: "Traffic" },
      { label: "May", value: 480, category: "Traffic" },
      { label: "Q1", value: 2000, category: "Revenue" },
      { label: "Q2", value: 2400, category: "Revenue" },
      { label: "Q3", value: 2100, category: "Revenue" },
    ];
    
    for (const item of seedData) {
      await storage.createDataPoint(item);
    }
    console.log("Database seeded with initial data");
  }
}
