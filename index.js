import express from "express";
import cors from "cors";
import pool from "./config/db.js"; // Asegúrate de que la ruta sea correcta
import uploadRoute from "./routes/upload.js"; 
import authRoute from "./routes/authRoutes.js";
import imagesRoute from "./routes/images.js";
import contactRoute from "./routes/contact.js";
import variablesRoute from "./routes/variables.js";
import requireAuth from "./middleware/authMiddleware.js";
import helmet from "helmet";
import cookieParser from "cookie-parser";   // 👈 ESTA LÍNEA FALTABA
import dotenv from "dotenv";

dotenv.config();

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "https://giacco.co",
  "https://www.giacco.co",
];

app.use(helmet());
app.disable("x-powered-by");
app.use(express.json());
app.use(cookieParser(process.env.COOKIE_SECRET)); // 👈 ahora funciona
app.use(
  cors({
    origin: (origin, callback) => {
      console.log("Incoming origin:", origin);
      if (!origin) return callback(null, true); // allow Postman, curl, etc.

      const isAllowed = allowedOrigins.some((allowed) =>
        typeof allowed === "string"
          ? allowed === origin
          : allowed instanceof RegExp && allowed.test(origin)
      );

      if (isAllowed) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    credentials: true,
  })
);

app.use((req, res, next) => {
  console.log("Incoming origin:", req.headers.origin);
  console.log("Request path:", req.path);
  next();
});
// ---------- PUBLIC ROUTES ----------
app.use(imagesRoute);  // /api/images, /api/image-categories
app.use(authRoute); // /login, /auth/me
app.use(variablesRoute); // /api/variables/:id

// ---------- ADMIN ROUTES (protected) ----------
app.use("/admin", requireAuth, uploadRoute);
// app.use("/admin", requireAuth, variablesRoute);

app.get("/", (req, res) => {
  res.send("Servidor OK");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor en puerto ${PORT}`));