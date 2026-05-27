import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

// Railway injects DATABASE_URL automatically when Postgres is in the same project
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10, // Railway hobby containers are single-instance, 10 is plenty
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
  ssl: { rejectUnauthorized: false }, // Railway Postgres requires SSL
});

export const db = drizzle(pool, { schema });
