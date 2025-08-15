import express from "express";
import pool from "../config/db.js"; // Asegúrate de que la ruta sea correcta
import cloudinary from "../config/cloudinary.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();
router.get("/api/images", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM images");
    res.json(result.rows);
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener imágenes" });
  }
});
// Obtener categorías y subcategorías únicas
router.get("/api/image-categories", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT DISTINCT category FROM images WHERE category IS NOT NULL
    `);
    const categories = result.rows.map(row => row.category);
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener categorías" });
  }
});
// 🧹 DELETE imagen
router.delete("/api/images/:id", verifyToken, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query("SELECT * FROM images WHERE id = $1", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Imagen no encontrada" });
    }

    const image = result.rows[0];

    if (image.public_id) {
      try {
        await cloudinary.uploader.destroy(image.public_id);
      } catch (cloudErr) {
        console.error("Error al eliminar en Cloudinary, pero continuamos:", cloudErr);
      }
    } else {
      console.warn("Imagen sin public_id, se salta borrado en Cloudinary");
    }

    await pool.query("DELETE FROM images WHERE id = $1", [id]);

    res.json({ message: "Imagen eliminada correctamente" });
  } catch (err) {
    console.error("Error al eliminar imagen:", err);
    res.status(500).json({ error: "Error al eliminar imagen" });
  }
});


export default router;
