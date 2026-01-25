// server/routes/admin.js
import express from "express";
import pool from "../config/db.js";              // adapta a tu import real
import cloudinary from "../config/cloudinary.js"; // adapta a tu import real
import requireAuth from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * Crear/guardar una imagen (antes: POST /api/guardar-url con verifyToken)
 * Ahora: POST /admin/images   (protegido por requireAuth a nivel app)
 * body: { url, category, public_id }
 */
// router.post("/images", async (req, res) => {
//   const { url, category, public_id } = req.body;

//   if (!url || !category || !public_id) {
//     return res.status(400).json({ error: "Faltan datos obligatorios" });
//   }

//   try {
//     await pool.query(
//       "INSERT INTO images (url, category, public_id) VALUES ($1, $2, $3)",
//       [url, category.trim(), public_id]
//     );

//     res.status(201).json({ message: "URL guardada con éxito" });
//   } catch (error) {
//     console.error("❌ Error al guardar URL:", error);
//     res.status(500).json({ error: "Error interno" });
//   }
// });

// /**
//  * Eliminar imagen (antes: DELETE /api/images/:id con verifyToken)
//  * Ahora: DELETE /admin/images/:id  (protegido por requireAuth a nivel app)
//  */
// router.delete("/images/:id", async (req, res) => {
//   const { id } = req.params;

//   try {
//     const result = await pool.query("SELECT * FROM images WHERE id = $1", [id]);
//     if (result.rows.length === 0) {
//       return res.status(404).json({ error: "Imagen no encontrada" });
//     }

//     const image = result.rows[0];

//     // Borrado en Cloudinary si corresponde, pero sin bloquear por error
//     if (image.public_id) {
//       try {
//         await cloudinary.uploader.destroy(image.public_id);
//       } catch (cloudErr) {
//         console.error("⚠️ Error al eliminar en Cloudinary, continuamos:", cloudErr);
//       }
//     }

//     await pool.query("DELETE FROM images WHERE id = $1", [id]);

//     res.json({ message: "Imagen eliminada correctamente" });
//   } catch (err) {
//     console.error("❌ Error al eliminar imagen:", err);
//     res.status(500).json({ error: "Error al eliminar imagen" });
//   }
// });

// export default router;
// Crear/guardar imagen
router.post("/images", requireAuth, async (req, res) => {
  const { url, category, public_id } = req.body;
  if (!url || !category || !public_id) {
    return res.status(400).json({ error: "Faltan datos obligatorios" });
  }

  try {
    await pool.query(
      "INSERT INTO images (url, category, public_id) VALUES ($1, $2, $3)",
      [url, category.trim(), public_id]
    );
    res.status(201).json({ message: "URL guardada con éxito" });
  } catch (err) {
    console.error("❌ Error al guardar URL:", err);
    res.status(500).json({ error: "Error interno" });
  }
});

// Eliminar imagen
router.delete("/images/:id", requireAuth, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query("SELECT * FROM images WHERE id = $1", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Imagen no encontrada" });
    }

    const image = result.rows[0];

    // Borrado en Cloudinary
    if (image.public_id) {
      try {
        await cloudinary.uploader.destroy(image.public_id);
      } catch (cloudErr) {
        console.error("⚠️ Error al eliminar en Cloudinary, continuamos:", cloudErr);
      }
    }

    await pool.query("DELETE FROM images WHERE id = $1", [id]);
    res.json({ message: "Imagen eliminada correctamente" });
  } catch (err) {
    console.error("❌ Error al eliminar imagen:", err);
    res.status(500).json({ error: "Error al eliminar imagen" });
  }
});
// List all images (for admin)
router.get("/images", requireAuth, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM images");
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error al obtener imágenes:", err);
    res.status(500).json({ error: "Error interno" });
  }
});
export default router;