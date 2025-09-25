// routes/upload.js  (MISMO PATH QUE TENÍAS, sin verifyToken)
import { Router } from "express";
import multer from "multer";
import cloudinary from "../config/cloudinary.js";
import pool from "../config/db.js";

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.post("/api/guardar-url", async (req, res) => {
  const { url, category, public_id } = req.body;

  if (!url || !category || !public_id) {
    return res.status(400).json({ error: "Faltan datos obligatorios" });
  }

  try {
    await pool.query(
      "INSERT INTO images (url, category, public_id) VALUES ($1, $2, $3)",
      [url, category.trim(), public_id]
    );
    res.status(200).json({ message: "URL guardada con éxito" });
  } catch (error) {
    console.error("❌ Error al guardar URL:", error);
    res.status(500).json({ error: "Error interno" });
  }
});

export default router;