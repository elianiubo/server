import express from "express";
import pool from "../config/db.js"; // Asegúrate de que la ruta sea correcta
import cloudinary from "../config/cloudinary.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/api/variables/:id", async (req, res) => {
  const { id } = req.params; // get id from URL
  try {
    const result = await pool.query(
      "SELECT url FROM variables WHERE id = $1",
      [id] // pass id as parameter
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Variable not found" });
    }

    res.json(result.rows[0]); // return the first match
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener la variable" });
  }
});

export default router;