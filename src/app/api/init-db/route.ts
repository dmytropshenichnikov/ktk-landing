import { NextResponse } from "next/server";
import sql from "@/lib/db";

export async function GET() {
  try {
    await sql(`CREATE TABLE IF NOT EXISTS admin_users (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`);

    await sql(`CREATE TABLE IF NOT EXISTS site_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )`);

    await sql(`CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      spec TEXT NOT NULL,
      price_from TEXT NOT NULL,
      description TEXT NOT NULL,
      image TEXT NOT NULL,
      details TEXT[] DEFAULT '{}',
      sort_order INT DEFAULT 0,
      active BOOLEAN DEFAULT true,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )`);
    // Add active column if missing (migration)
    await sql(`ALTER TABLE products ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true`).catch(() => {});

    await sql(`CREATE TABLE IF NOT EXISTS services (
      id SERIAL PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      details TEXT NOT NULL,
      image TEXT NOT NULL,
      meta TEXT DEFAULT '',
      sort_order INT DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )`);

    await sql(`CREATE TABLE IF NOT EXISTS reviews (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      text TEXT NOT NULL,
      image TEXT DEFAULT '',
      sort_order INT DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`);
    await sql(`CREATE UNIQUE INDEX IF NOT EXISTS reviews_name_text_idx ON reviews (name, text)`).catch(() => {});

    // Analytics events table
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

    // Landing pages table
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

    // Insert default admin if not exists
    const adminEmail = process.env.ADMIN_EMAIL || "admin@ktk.com.ua";
    const adminPass = process.env.ADMIN_PASSWORD || "ktkadmin2026";
    
    // We'll use a simple hash approach
    const { createHash } = await import("crypto");
    const hash = createHash("sha256").update(adminPass).digest("hex");
    
    await sql(`INSERT INTO admin_users (email, password_hash) 
      VALUES ($1, $2) ON CONFLICT (email) DO NOTHING`, 
      [adminEmail, hash]);

    return NextResponse.json({ success: true, message: "Database initialized" });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
