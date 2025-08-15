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
  'http://localhost:5173',
  /^https:\/\/.*\.vercel\.app$/,
  /^https:\/\/.*\.mycustomdomain\.com$/
];;

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // allow local tools like Postman
    if (
      allowedOrigins.some((allowed) =>
        typeof allowed === "string"
          ? allowed === origin
          : allowed instanceof RegExp && allowed.test(origin)
      )
    ) {
      callback(null, true);
    } else {
      callback(new Error(`CORS bloqueado para origen: ${origin}`));
    }
  }
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



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor en puerto ${PORT}`));