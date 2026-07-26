import { NextResponse } from "next/server";
import { hashPassword, generateToken, verifyLogin } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }
    
    const valid = await verifyLogin(email, password);
    if (!valid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }
    
    const token = generateToken(email);
    return NextResponse.json({ token, email });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
