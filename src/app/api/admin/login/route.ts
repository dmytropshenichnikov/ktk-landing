import { NextResponse } from "next/server";
import { hashPassword, generateToken, verifyLogin } from "@/lib/auth";

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
    
    const response = NextResponse.json({ token, email: cleanEmail });
    
    // Set cookie for server-side auth
    response.headers.set("Set-Cookie", `admin_token=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=604800`);
    
    return response;
  } catch (e: any) {
    console.error("Login error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
