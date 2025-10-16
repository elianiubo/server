// config/db.js
import "dotenv/config";        // 👈 asegura que .env se carga ANTES de leer vars
import pg from "pg";
const { Pool } = pg;

// En dev usarás la URL pública de Railway (proxy.rlwy.net); en prod, la propia de Railway (sin tocar código)
const connectionString =
  process.env.DATABASE_URL || process.env.DATABASE_URL_PG;

if (!connectionString) {
  throw new Error("DATABASE_URL no está definido");
}

// Si NO es localhost, fuerza SSL
const needsSSL =
  !/localhost|127\.0\.0\.1/.test(connectionString) &&
  !connectionString.includes("sslmode=disable");

const pool = new Pool({
  connectionString,          // 👈 NO añadas user/password aquí. Deja que vengan en la URL
  ssl: needsSSL ? { rejectUnauthorized: false } : false,
});

export default pool;