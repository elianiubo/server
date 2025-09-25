import express from "express";
import pool from "../config/db.js"; // Asegúrate de que la ruta sea correcta


// Listar imágenes (público)
const router = express.Router();
router.get("/api/images", async (_req, res) => {
  try {
    const result = await pool.query("SELECT * FROM images");
    res.json(result.rows);
  } catch (error) {
    console.error("❌ Error al obtener imágenes:", error);
    res.status(500).json({ error: "Error al obtener imágenes" });
  }
});

// Categorías únicas (público)
router.get("/api/image-categories", async (_req, res) => {
  try {
    const result = await pool.query(
      "SELECT DISTINCT category FROM images WHERE category IS NOT NULL"
    );
    const categories = result.rows.map((row) => row.category);
    res.json(categories);
  } catch (err) {
    console.error("❌ Error al obtener categorías:", err);
    res.status(500).json({ error: "Error al obtener categorías" });
  }
});

export default router;