// Database helper - supports both Neon REST API and direct PostgreSQL connection
import { Pool } from "pg";

let pool: Pool | null = null;

function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL || "",
      ssl: { rejectUnauthorized: false },
      max: 10,
    });
  }
  return pool;
}

// Try REST API first, fall back to pg pool
export async function sql(query: string, params?: any[]): Promise<any[]> {
  const dbUrl = process.env.NEON_DB_URL;
  const apiKey = process.env.NEON_API_KEY;

  // Try REST API if URL and key are available
  if (dbUrl && apiKey) {
    try {
      const sqlUrl = dbUrl.replace("/rest/v1", "") + "/sql";
      const res = await fetch(sqlUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": apiKey,
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ query, params }),
      });
      if (res.ok) {
        return await res.json();
      }
      console.warn("REST API failed, falling back to PG:", await res.text().catch(() => ""));
    } catch (e: any) {
      console.warn("REST API error, falling back to PG:", e.message);
    }
  }

  // Fall back to direct PostgreSQL connection
  try {
    const client = await getPool().connect();
    try {
      const result = await client.query(query, params || []);
      return result.rows;
    } finally {
      client.release();
    }
  } catch (e: any) {
    console.error("DB query error:", e.message);
    throw e;
  }
}

export default sql;
