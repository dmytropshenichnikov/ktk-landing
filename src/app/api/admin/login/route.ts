import { NextResponse } from "next/server";
import { hashPassword, generateToken, verifyLogin } from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }
    
    const cleanEmail = email.trim().toLowerCase();
    const valid = await verifyLogin(cleanEmail, password);
    if (!valid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }
    
    const token = generateToken(cleanEmail);
    
    // Also set cookie for server-side auth
    const response = NextResponse.json({ token, email: cleanEmail });
    response.cookies.set("admin_token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/adminpanel",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
    
    return response;
  } catch (e: any) {
    console.error("Login error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
