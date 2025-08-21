// index.js
import express from "express";
import cors from "cors";
import pool from "./config/db.js"; // Asegúrate de que la ruta sea correcta
import uploadRoute from "./routes/upload.js"; 
import authRoute from "./routes/authRoutes.js";
import imagesRoute from "./routes/images.js"; // ajusta el path correcto
import contactRoute from "./routes/contact.js"; // ajusta el path correcto
import variablesRoute from "./routes/variables.js"; // ajusta el path correcto
import dotenv from 'dotenv';
import { Router } from "express";
dotenv.config();

const app = express();
const router = Router();

// const allowedOrigins = [
//   "http://localhost:5173",
//   /^https:\/\/.*\.vercel\.app$/,
//   /^https:\/\/.*\.elianiubo\.com$/
// ];
const corsOptions = {
  origin: [
    "http://localhost:5173",
    "https://elianiubo.com",
    "https://www.elianiubo.com"
  ],
  credentials: true,
};
router.options("/api/upload-multiple", cors(corsOptions)); // preflight
// Configuración CORS simplificada y corregida
app.use(cors({
  origin: (origin, callback) => {
    console.log("Incoming origin:", origin);
    // Permitir requests sin origin (Postman, curl, etc.)
    if (!origin) return callback(null, true);
    
    const isAllowed = allowedOrigins.some((allowed) =>
      typeof allowed === "string"
        ? allowed === origin
        : allowed instanceof RegExp && allowed.test(origin)
    );
    
    if (isAllowed) {
      callback(null, true);
    } else {
      console.log("Origin not allowed:", origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200 // Para navegadores legacy
}));

app.use(express.json());

app.use(authRoute);
app.use(uploadRoute);
app.use(imagesRoute);
app.use(contactRoute)
app.use(variablesRoute)
app.get("/", (req, res) => {
  res.send("Servidor OK");
});


// Middleware de manejo de errores
app.use((err, req, res, next) => {
  console.error('Error:', err);
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ error: 'CORS: Origin not allowed' });
  }
  res.status(500).json({ error: 'Error interno del servidor' });
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor en puerto ${PORT}`));