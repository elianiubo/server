import pg from 'pg';
const { Pool } = pg;
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL_PG,
//   ssl: { rejectUnauthorized: false },
});

export default pool;