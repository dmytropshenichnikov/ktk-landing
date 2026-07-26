import { NextResponse } from "next/server";
import { verifyToken, getAuthToken } from "@/lib/auth";

export async function GET(request: Request) {
  const token = getAuthToken(request);
  if (!token) {
    return NextResponse.json({ valid: false }, { status: 401 });
  }
  const email = verifyToken(token);
  if (!email) {
    return NextResponse.json({ valid: false }, { status: 401 });
  }
  return NextResponse.json({ valid: true, email });
}
