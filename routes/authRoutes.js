import express from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();

// ⚠️ Email/contraseña hardcoded para este ejemplo simple
const ADMIN_EMAIL = "admin@ejemplo.com";
const ADMIN_PASSWORD = "123456"; // En producción, usa bcrypt y una base de datos

router.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Credenciales incorrectas" });
  }

  const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "2h" });
  res.json({ token });
});

export default router;
//https://client-01-git-master-elianiubos-projects.vercel.app