// ✅ En routes/upload.js (o como se llame tu ruta de subida)
import { Router } from "express";
import multer from "multer";
import cloudinary from "../config/cloudinary.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import pool from "../config/db.js";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() ,limits: { fileSize: 5 * 1024 * 1024 } },
);

// ✅ Aceptar múltiples imágenes
router.post(
  "/api/upload-multiple",
  verifyToken,
  upload.array("images"),
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

    const uploadImage = (file) =>
      new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: category },
          async (error, result) => {
            if (error) return reject(error);

            try {
              await pool.query(
                "INSERT INTO images (title, url, category, public_id) VALUES ($1, $2, $3, $4)",
                [
                  result.original_filename,
                  result.secure_url,
                  category,
                  result.public_id,
                ]
              );

              resolve({
                url: result.secure_url,
                public_id: result.public_id,
              });
            } catch (dbErr) {
              reject(dbErr);
            }
          }
        );

        stream.end(file.buffer);
      });

    try {
      const results = await Promise.all(files.map(uploadImage));
      res
        .status(200)
        .json({ message: "Imágenes subidas correctamente", images: results });
    } catch (err) {
      console.error("❌ Error al subir imágenes:", err.message);
      res.status(500).json({ error: "Error al subir imágenes" });
    }
  }
);


export default router;