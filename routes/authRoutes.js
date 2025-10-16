import express from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import requireAuth from "../middleware/authMiddleware.js"; // 👈 ADD THIS
dotenv.config();

const router = express.Router();

// ⚠️ Email/contraseña hardcoded para este ejemplo simple
const ADMIN_EMAIL = "giacco.photo@gmail.com";
const ADMIN_PASSWORD = "123456"; // En producción, usa bcrypt y una base de datos

router.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Credenciales incorrectas" });
  }

 // ✅ CREA el token
  const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "2h" });

  // ✅ Setea cookie httpOnly (sin firmar en dev)
  const isProd = process.env.NODE_ENV === "production";
  res.cookie("token", token, {
    httpOnly: true,
    secure: isProd ? true : false, // en prod: true (HTTPS)
    sameSite: isProd ? "none" : "lax",
    maxAge: 2 * 60 * 60 * 1000,
    path: "/",
  });

  // ✅ Responde una sola vez
  return res.json({ ok: true });
});


router.get("/auth/me", requireAuth, (req, res) => {
  res.json({ ok: true, user: req.user });
});


export default router;