import { Pool } from "pg";

let pool: Pool | null = null;

function getConnectionString(): string {
  // Check all possible env var names that Neon/Vercel might use
  const vars = [
    process.env.DATABASE_URL,
    process.env.POSTGRES_URL,
    process.env.POSTGRES_URL_NON_POOLING,
    process.env.NEON_DATABASE_URL,
  ];
  
  for (const v of vars) {
    if (v && v.startsWith("postgresql://")) {
      return v;
    }
  }
  
  // Debug: log what's available
  console.log("Available DB env vars:", {
    DATABASE_URL: process.env.DATABASE_URL ? "set" : "not set",
    POSTGRES_URL: process.env.POSTGRES_URL ? "set" : "not set",
    POSTGRES_URL_NON_POOLING: process.env.POSTGRES_URL_NON_POOLING ? "set" : "not set",
  });
  
  return "";
}

function getPool(): Pool {
  if (!pool) {
    const connStr = getConnectionString();
    if (!connStr) {
      throw new Error(
        "Database not configured. Add DATABASE_URL to Vercel Environment Variables."
      );
    }
    console.log("Connecting to DB with:", connStr.slice(0, 40) + "...");
    pool = new Pool({
      connectionString: connStr,
      ssl: connStr.includes("sslmode=require") ? undefined : { rejectUnauthorized: false },
      max: 5,
      connectionTimeoutMillis: 10000,
    });
  }
  return pool;
}

export async function sql(query: string, params?: any[]): Promise<any[]> {
  const client = await getPool().connect();
  try {
    const result = await client.query(query, params || []);
    return result.rows;
  } catch (e: any) {
    console.error("DB error:", e.message);
    throw e;
  } finally {
    client.release();
  }
}

export default sql;
