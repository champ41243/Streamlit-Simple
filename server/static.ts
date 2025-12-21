import express, { type Express } from "express";
import fs from "fs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

// สร้างตัวแปร __dirname ขึ้นมาใช้เอง
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function serveStatic(app: Express) {
  // แก้ตรงนี้ครับ! เพิ่ม "public" เข้าไปเพื่อให้ตรงกับที่ Vite สร้างไว้
  const distPath = path.resolve(__dirname, "..", "dist", "public");

  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  app.use(express.static(distPath));

  // ถ้าหาไฟล์ไม่เจอ ให้ส่งกลับไปที่หน้า index.html
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}