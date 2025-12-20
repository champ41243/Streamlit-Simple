import express, { type Express } from "express";
import fs from "fs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

// สร้างตัวแปร __dirname ขึ้นมาใช้เอง (สำหรับระบบ ES Modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function serveStatic(app: Express) {
  // ชี้ไปที่โฟลเดอร์ dist (ที่ได้จากการ Build หน้าเว็บ)
  const distPath = path.resolve(__dirname, "..", "dist");

  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  app.use(express.static(distPath));

  // ถ้าหาไฟล์ไม่เจอ ให้ส่งกลับไปที่หน้า index.html (สำหรับ Single Page App)
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}