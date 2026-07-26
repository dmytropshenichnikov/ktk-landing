import { NextResponse } from "next/server";
import { verifyToken, getAuthToken } from "@/lib/auth";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  // Try cookie first (set on login)
  try {
    const cookieStore = await cookies();
    const cookieToken = cookieStore.get("admin_token")?.value;
    if (cookieToken) {
      const email = verifyToken(cookieToken);
      if (email) {
        return NextResponse.json({ valid: true, email, via: "cookie" });
      }
    }
  } catch (e) {
    console.log("Cookie check failed:", e);
  }
  
  // Try Authorization header
  const headerToken = getAuthToken(request);
  if (headerToken) {
    const email = verifyToken(headerToken);
    if (email) {
      return NextResponse.json({ valid: true, email, via: "header" });
    }
  }
  
  return NextResponse.json({ valid: false, error: "not authenticated" }, { status: 401 });
}
