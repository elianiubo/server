import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export default function requireAuth(req, res, next) {
  // Permitir preflight CORS
  if (req.method === "OPTIONS") return res.sendStatus(204);

  // 1) Cookie httpOnly (preferida)
  const tokenFromCookie = req.signedCookies?.token || req.cookies?.token;

  // 2) Authorization: Bearer <token> (compatibilidad)
  const authHeader = req.headers.authorization || "";
  const tokenFromHeader = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null;

  const token = tokenFromCookie || tokenFromHeader;
  if (!token) return res.status(401).json({ error: "No autorizado" });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    return next();
  } catch (e) {
    return res.status(401).json({ error: "Token inválido o expirado" });
  }
}
