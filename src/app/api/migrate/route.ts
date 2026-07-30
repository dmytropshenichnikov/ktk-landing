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
    await sql(`DELETE FROM reviews WHERE id NOT IN (SELECT MIN(id) FROM reviews GROUP BY name, text)`);
    results.push("review duplicates removed");
  } catch (e: any) {
    results.push("review dedup error: " + e.message);
  }

  try {
    await sql(`CREATE UNIQUE INDEX IF NOT EXISTS reviews_name_text_idx ON reviews (name, text)`);
    results.push("reviews unique index created");
  } catch (e: any) {
    results.push("reviews index error: " + e.message);
  }

  // Create analytics_events table (for existing DBs that didn't get it from init-db)
  try {
    await sql(`CREATE TABLE IF NOT EXISTS analytics_events (
      id SERIAL PRIMARY KEY,
      event_type TEXT NOT NULL,
      event_data TEXT DEFAULT '',
      page_url TEXT DEFAULT '',
      referrer TEXT DEFAULT '',
      utm_source TEXT DEFAULT '',
      utm_medium TEXT DEFAULT '',
      utm_campaign TEXT DEFAULT '',
      user_agent TEXT DEFAULT '',
      ip_address TEXT DEFAULT '',
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`);
    await sql(`CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON analytics_events (event_type)`);
    await sql(`CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON analytics_events (created_at)`);
    results.push("analytics_events table created");
  } catch (e: any) {
    results.push("analytics_events error: " + e.message);
  }

  // Create landing_pages table
  try {
    await sql(`CREATE TABLE IF NOT EXISTS landing_pages (
      id SERIAL PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      is_active BOOLEAN DEFAULT true,
      hero_title TEXT DEFAULT '',
      hero_subtitle TEXT DEFAULT '',
      hero_label TEXT DEFAULT '',
      hero_points TEXT[] DEFAULT '{}',
      form_title TEXT DEFAULT '',
      form_subtitle TEXT DEFAULT '',
      form_button TEXT DEFAULT '',
      form_success TEXT DEFAULT '',
      section_products_label TEXT DEFAULT '',
      section_products_title TEXT DEFAULT '',
      section_services_label TEXT DEFAULT '',
      section_reviews_label TEXT DEFAULT '',
      section_reviews_title TEXT DEFAULT '',
      contact_strip_label TEXT DEFAULT '',
      contact_strip_title TEXT DEFAULT '',
      contacts_label TEXT DEFAULT '',
      contacts_title TEXT DEFAULT '',
      custom_css TEXT DEFAULT '',
      custom_html TEXT DEFAULT '',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )`);
    results.push("landing_pages table created");
  } catch (e: any) {
    results.push("landing_pages error: " + e.message);
  }

  return NextResponse.json({ success: true, results });
}
