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
dotenv.config();

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  /^https:\/\/.*\.vercel\.app$/,
  /^https:\/\/.*\.mycustomdomain\.com$/
];

app.use(cors({
  origin: (origin, callback) => {
    console.log("Incoming origin:", origin);
    if (!origin) return callback(null, true); // allow Postman, curl, etc.

    const isAllowed = allowedOrigins.some((allowed) =>
      typeof allowed === "string"
        ? allowed === origin
        : allowed instanceof RegExp && allowed.test(origin)
    );

    if (isAllowed) {
      callback(null, true); // ✅ add CORS headers
    } else {
      callback(null, false); // ❌ no headers, request rejected by browser
    }
  },
  credentials: true // add this if you ever use cookies/auth headers
}));
app.use(express.json());
app.use((req, res, next) => {
  console.log("Incoming origin:", req.headers.origin);
  console.log("Request path:", req.path);
  next();
});
app.use(authRoute);
app.use(uploadRoute);
app.use(imagesRoute);
app.use(contactRoute)
app.use(variablesRoute)
app.get("/", (req, res) => {
  res.send("Servidor OK");
});



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor en puerto ${PORT}`));