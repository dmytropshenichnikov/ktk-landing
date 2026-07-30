import { NextResponse } from "next/server";
import { verifyToken, getAuthToken } from "@/lib/auth";
import sql from "@/lib/db";

const TABLES: Record<string, string> = {
  products: "products",
  services: "services",
  reviews: "reviews",
  settings: "site_settings",
  applications: "applications",
  "landing-pages": "landing_pages",
};

function checkAuth(request: Request): boolean {
  const token = getAuthToken(request);
  if (!token) return false;
  return !!verifyToken(token);
}

export async function GET(request: Request, { params }: { params: Promise<{ type: string }> }) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  const { type } = await params;
  const table = TABLES[type];
  if (!table) {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }
  
  try {
    const url = new URL(request.url);
    const key = url.searchParams.get("key");
    
    if (table === "site_settings" && key) {
      const rows = await sql(`SELECT value FROM site_settings WHERE key = $1`, [key]);
      return NextResponse.json(rows[0] || null, { headers: { "Cache-Control": "public, max-age=30" } });
    }
    
    const orderClause = table === "applications" ? "id DESC" : "sort_order ASC, id DESC";
    const rows = await sql(`SELECT * FROM ${table} ORDER BY ${orderClause}`);
    return NextResponse.json(rows, { headers: { "Cache-Control": "public, max-age=30, s-maxage=60" } });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ type: string }> }) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  const { type } = await params;
  const table = TABLES[type];
  if (!table) {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }
  
  try {
    const body = await request.json();
    
    if (table === "site_settings") {
      await sql(`INSERT INTO site_settings (key, value) VALUES ($1, $2) 
        ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()`,
        [body.key, body.value]);
      return NextResponse.json({ success: true });
    }
    
    if (table === "products") {
      const r = await sql(`INSERT INTO products (slug, name, spec, price_from, description, image, details, sort_order, active)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, COALESCE($9, true)) RETURNING id`,
        [body.slug, body.name, body.spec, body.price_from, body.description, body.image, body.details || [], body.sort_order || 0, body.active !== false]);
      return NextResponse.json({ success: true, id: r[0]?.id });
    }
    
    if (table === "services") {
      const r = await sql(`INSERT INTO services (slug, name, details, image, meta, sort_order)
        VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
        [body.slug, body.name, body.details, body.image, body.meta || "", body.sort_order || 0]);
      return NextResponse.json({ success: true, id: r[0]?.id });
    }
    
    if (table === "reviews") {
      const r = await sql(`INSERT INTO reviews (name, role, text, image, sort_order)
        VALUES ($1, $2, $3, $4, $5) RETURNING id`,
        [body.name, body.role, body.text, body.image || "", body.sort_order || 0]);
      return NextResponse.json({ success: true, id: r[0]?.id });
    }
    
    return NextResponse.json({ error: "Not implemented" }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ type: string }> }) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  const { type } = await params;
  const table = TABLES[type];
  if (!table) {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }
  
  try {
    const body = await request.json();
    const { id, ...data } = body;
    
    if (!id) {
      return NextResponse.json({ error: "ID required" }, { status: 400 });
    }
    
    if (table === "products") {
      await sql(`UPDATE products SET slug=$1, name=$2, spec=$3, price_from=$4, description=$5, image=$6, details=$7, sort_order=$8, active=$9, updated_at=NOW() WHERE id=$10`,
        [data.slug, data.name, data.spec, data.price_from, data.description, data.image, data.details || [], data.sort_order || 0, data.active !== false, id]);
    } else if (table === "services") {
      await sql(`UPDATE services SET slug=$1, name=$2, details=$3, image=$4, meta=$5, sort_order=$6, updated_at=NOW() WHERE id=$7`,
        [data.slug, data.name, data.details, data.image, data.meta || "", data.sort_order || 0, id]);
    } else     if (table === "reviews") {
      await sql(`UPDATE reviews SET name=$1, role=$2, text=$3, image=$4, sort_order=$5 WHERE id=$6`,
        [data.name, data.role, data.text, data.image || "", data.sort_order || 0, id]);
    }
    
    if (table === "applications") {
      await sql(`UPDATE applications SET status=$1 WHERE id=$2`, [data.status || "new", id]);
      return NextResponse.json({ success: true });
    }
    
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ type: string }> }) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  const { type } = await params;
  const table = TABLES[type];
  if (!table) {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }
  
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "ID required" }, { status: 400 });
    }
    
    await sql(`DELETE FROM ${table} WHERE id = $1`, [parseInt(id)]);
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
