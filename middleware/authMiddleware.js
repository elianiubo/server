import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
export function verifyToken(req, res, next) {
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      error: "Token de autorización requerido",
      code: "NO_TOKEN"
    });
  }

  if (!authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "Formato de token inválido. Use: Bearer <token>",
      code: "INVALID_FORMAT"
    });
  }

  const token = authHeader.slice(7); // después de "Bearer "

  if (!token) {
    return res.status(401).json({
      error: "Token vacío",
      code: "EMPTY_TOKEN"
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    console.log("✅ Token válido para usuario:", decoded.userId || decoded.id);
    next();
  } catch (err) {
    console.error("❌ Error de verificación de token:", err.message);

    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: "Token expirado",
        code: "TOKEN_EXPIRED"
      });
    }

    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: "Token inválido",
        code: "INVALID_TOKEN"
      });
    }

    return res.status(401).json({
      error: "Error de autenticación",
      code: "AUTH_ERROR"
    });
  }
}