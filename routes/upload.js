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
const corsOptions = {
  origin: [
    "http://localhost:5173",
    "https://elianiubo.com",
    "https://www.elianiubo.com"
  ],
  credentials: true,
};
// Preflight específico para esta ruta (por si algún middleware bloquea OPTIONS)
router.options("/api/upload-multiple", cors());

// POST /api/upload-multiple
router.post(
  "/upload-multiple",
  cors(corsOptions), // ✅ AÑADE ESTO AQUÍ
  verifyToken,
  (req, res, next) => {
    upload.array("images", 4)(req, res, (err) => {
      if (err) {
        console.error("Error de multer:", err);
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(413).json({ 
            error: "Archivo demasiado grande (máximo 5MB por imagen)" 
          });
        }
        if (err.code === "LIMIT_FILE_COUNT") {
          return res.status(413).json({ 
            error: "Demasiados archivos (máximo 4 imágenes)" 
          });
        }
        return res.status(400).json({ 
          error: `Error de subida: ${err.message}` 
        });
      }
      next();
    });
  },
  async (req, res) => {
    try {
      const rawCategory = req.body.category;
      const category = rawCategory?.trim();

      if (!category) {
        return res.status(400).json({ error: "Categoría requerida" });
      }

      const files = req.files;
      if (!files || files.length === 0) {
        return res.status(400).json({ error: "No se recibieron archivos" });
      }

      console.log(`Procesando ${files.length} archivos para categoría: ${category}`);

      // Re-sincronizar secuencia de PostgreSQL
      await pool.query(`
        SELECT setval(
          'images_id_seq',
          COALESCE((SELECT MAX(id) FROM images), 0) + 1,
          false
        )
      `);

      const uploadImage = (file, index) =>
        new Promise((resolve, reject) => {
          console.log(`Subiendo imagen ${index + 1}/${files.length}`);
          
          const stream = cloudinary.uploader.upload_stream(
            { 
              folder: category,
              resource_type: "image",
              quality: "auto:good",
              fetch_format: "auto"
            },
            async (error, result) => {
              if (error) {
                console.error(`Error al subir imagen ${index + 1}:`, error);
                return reject(error);
              }
              
              try {
                console.log(`Guardando en BD imagen ${index + 1}: ${result.secure_url}`);
                await pool.query(
                  "INSERT INTO images (url, category, public_id) VALUES ($1, $2, $3)",
                  [result.secure_url, category, result.public_id]
                );
                resolve({
                  url: result.secure_url,
                  public_id: result.public_id
                });
              } catch (dbErr) {
                console.error(`Error BD para imagen ${index + 1}:`, dbErr);
                reject(dbErr);
              }
            }
          );
          stream.end(file.buffer);
        });

      const results = await Promise.all(
        files.map((file, index) => uploadImage(file, index))
      );

      console.log(`✅ ${results.length} imágenes subidas exitosamente`);

      res.status(200).json({
        success: true,
        message: `${results.length} imágenes subidas correctamente`,
        images: results
      });

    } catch (err) {
      console.error("❌ Error al subir imágenes:", err);
      res.status(500).json({ 
        error: "Error interno al procesar las imágenes",
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
  }
);


export default router;