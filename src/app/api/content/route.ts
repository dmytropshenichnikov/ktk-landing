import { NextResponse } from "next/server";
import sql from "@/lib/db";

export async function GET() {
  try {
    const [products, services, reviews, settings] = await Promise.all([
      sql(`SELECT * FROM products ORDER BY sort_order ASC`),
      sql(`SELECT * FROM services ORDER BY sort_order ASC`),
      sql(`SELECT * FROM reviews ORDER BY sort_order ASC`),
      sql(`SELECT * FROM site_settings`),
    ]);

    const settingsMap: Record<string, string> = {};
    (settings as any[]).forEach((s: any) => {
      settingsMap[s.key] = s.value;
    });

    return NextResponse.json({ products, services, reviews, settings: settingsMap });
  } catch (e: any) {
    // Fallback to static data if DB not available
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
