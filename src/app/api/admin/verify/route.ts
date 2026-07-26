import { NextResponse } from "next/server";
import { verifyToken, getAuthToken } from "@/lib/auth";

export async function GET(request: Request) {
  // 1. Try cookie
  const cookieHeader = request.headers.get("cookie") || "";
  const cookies = Object.fromEntries(
    cookieHeader.split(";").filter(Boolean).map(c => {
      const [k, ...v] = c.trim().split("=");
      return [k, v.join("=")];
    })
  );
  
  let token = cookies["admin_token"];
  let source = "cookie";
  
  // 2. Try Authorization header as fallback
  if (!token) {
    token = getAuthToken(request);
    source = "header";
  }
  
  if (!token) {
    return NextResponse.json({ valid: false, error: "no token" }, { status: 401 });
  }
  
  const email = verifyToken(token);
  if (!email) {
    return NextResponse.json({ valid: false, error: "invalid token" }, { status: 401 });
  }
  
  return NextResponse.json({ valid: true, email, source });
}
