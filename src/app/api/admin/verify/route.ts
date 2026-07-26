import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

export async function GET(request: Request) {
  const url = new URL(request.url);
  
  // 1. Try query param (?token=...)
  const queryToken = url.searchParams.get("token");
  if (queryToken) {
    const email = verifyToken(queryToken);
    if (email) return NextResponse.json({ valid: true, email, via: "query" });
  }
  
  // 2. Try Authorization header
  const auth = request.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) {
    const token = auth.slice(7);
    const email = verifyToken(token);
    if (email) return NextResponse.json({ valid: true, email, via: "header" });
  }
  
  // 3. Try cookie
  const cookieHeader = request.headers.get("cookie") || "";
  const cookies = Object.fromEntries(
    cookieHeader.split(";").filter(Boolean).map(c => {
      const [k, ...v] = c.trim().split("=");
      return [k, v.join("=")];
    })
  );
  const cookieToken = cookies["admin_token"];
  if (cookieToken) {
    const email = verifyToken(cookieToken);
    if (email) return NextResponse.json({ valid: true, email, via: "cookie" });
  }
  
  return NextResponse.json({ 
    valid: false, 
    hasAuth: !!auth,
    hasCookie: !!cookies["admin_token"],
    hasQuery: !!queryToken,
  }, { status: 401 });
}
