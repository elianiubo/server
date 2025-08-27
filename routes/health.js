import express from "express";
import pkg from "../package.json" assert { type: "json" };

const router = express.Router();

router.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    service: pkg.name,
    version: pkg.version,
    env: process.env.NODE_ENV || "development",
    uptime_s: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

// Opcional: HEAD /health para checks aún más rápidos
router.head("/api/health", (req, res) => res.sendStatus(200));

export default router;