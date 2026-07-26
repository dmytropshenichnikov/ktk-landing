import { NextResponse } from "next/server";
import sql from "@/lib/db";
import { createHash } from "crypto";

export async function GET() {
  try {
    const email = (process.env.ADMIN_EMAIL || "admin@ktk.com.ua").trim();
    const password = process.env.ADMIN_PASSWORD || "ktkadmin2026";
    const hash = createHash("sha256").update(password).digest("hex");

    // Delete ALL existing admins
    await sql(`DELETE FROM admin_users`);
    
    // Create fresh admin
    await sql(`INSERT INTO admin_users (email, password_hash) VALUES ($1, $2)`, [email, hash]);

    const admins = await sql(`SELECT id, email FROM admin_users`);
    
    return NextResponse.json({ 
      success: true, 
      message: "Admin recreated", 
      admin: admins,
      email_used: email
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
