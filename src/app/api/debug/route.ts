import { NextResponse } from "next/server";

export async function GET() {
  const dbUrl = process.env.DATABASE_URL ? "set (" + process.env.DATABASE_URL.slice(0, 30) + "...)" : "NOT SET";
  const pgUrl = process.env.POSTGRES_URL ? "set" : "NOT SET";
  const adminEmail = process.env.ADMIN_EMAIL || "NOT SET";
  const neonDbUrl = process.env.NEON_DB_URL ? "set" : "NOT SET";
  
  return NextResponse.json({
    DATABASE_URL: dbUrl,
    POSTGRES_URL: pgUrl,
    ADMIN_EMAIL: adminEmail,
    NEON_DB_URL: neonDbUrl,
    NODE_ENV: process.env.NODE_ENV,
  });
}
