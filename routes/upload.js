// ✅ En routes/upload.js (o como se llame tu ruta de subida)
import { Router } from "express";
import cors from "cors";
import multer from "multer";
import cloudinary from "../config/cloudinary.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import pool from "../config/db.js";

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } },
);
// Preflight específico para esta ruta (por si algún middleware bloquea OPTIONS)
router.options("/api/upload-multiple", cors());

// POST /api/upload-multiple
router.post(
  "/api/upload-multiple",
  verifyToken,
  (req, res, next) => {
    upload.array("images")(req, res, (err) => {
      if (err) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(413).json({ error: "Archivo demasiado grande (max 5MB)" });
        }
        return res.status(400).json({ error: `Error de subida: ${err.message}` });
      }
      next();
    });
  },
  async (req, res) => {
    const rawCategory = req.body.category;
    const category = rawCategory?.trim();

    if (!category) {
      return res.status(400).json({ error: "Categoría no válida" });
    }

    const files = req.files;
    if (!files || files.length === 0) {
      return res.status(400).json({ error: "No se recibieron archivos" });
    }
    if (files.length > 4) {
      return res.status(400).json({ error: "Máximo 4 imágenes permitidas" });
    }

    try {
      // Re-sincroniza la secuencia (si usas PostgreSQL con SERIAL/IDENTITY)
      await pool.query(`
        SELECT setval(
          'images_id_seq',
          COALESCE((SELECT MAX(id) FROM images), 0) + 1,
          false
        )
      `);

      const uploadImage = (file) =>
        new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: category },
            async (error, result) => {
              if (error) return reject(error);
              try {
                await pool.query(
                  "INSERT INTO images (url, category, public_id) VALUES ($1, $2, $3)",
                  [result.secure_url, category, result.public_id]
                );
                resolve({
                  url: result.secure_url,
                  public_id: result.public_id
                });
              } catch (dbErr) {
                reject(dbErr);
              }
            }
          );
          stream.end(file.buffer);
        });

      const results = await Promise.all(files.map(uploadImage));
      res.status(200).json({
        message: "Imágenes subidas correctamente",
        images: results
      });
    } catch (err) {
      console.error("❌ Error al subir imágenes:", err);
      res.status(500).json({ error: "Error al subir imágenes" });
    }
  }
);


export default router;