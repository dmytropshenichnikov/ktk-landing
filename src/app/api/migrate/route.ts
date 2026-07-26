import { NextResponse } from "next/server";
import sql from "@/lib/db";

export async function GET() {
  const results: string[] = [];

  try {
    await sql(`ALTER TABLE products ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true`);
    results.push("products.active column added");
  } catch (e: any) {
    results.push("products.active error: " + e.message);
  }

  try {
    await sql(`CREATE UNIQUE INDEX IF NOT EXISTS reviews_name_text_idx ON reviews (name, text)`);
    results.push("reviews unique index created");
  } catch (e: any) {
    results.push("reviews index error: " + e.message);
  }

  try {
    await sql(`DELETE FROM reviews WHERE id NOT IN (SELECT MIN(id) FROM reviews GROUP BY name, text)`);
    results.push("review duplicates removed");
  } catch (e: any) {
    results.push("review dedup error: " + e.message);
  }

  return NextResponse.json({ success: true, results });
}
