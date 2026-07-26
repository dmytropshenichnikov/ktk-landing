import { createHash, randomBytes } from "crypto";
import sql from "./db";

export function hashPassword(password: string): string {
  return createHash("sha256").update(password).digest("hex");
}

export function generateToken(email: string): string {
  const ts = Date.now().toString(36);
  const rand = randomBytes(16).toString("hex");
  const payload = `${email}:${ts}:${rand}`;
  const sig = createHash("sha256").update(payload + (process.env.JWT_SECRET || "ktk-secret")).digest("hex");
  return Buffer.from(`${payload}.${sig}`).toString("base64url");
}

export function verifyToken(token: string): string | null {
  try {
    const decoded = Buffer.from(token, "base64url").toString();
    const parts = decoded.split(".");
    if (parts.length !== 2) return null;
    const payload = parts[0];
    const sig = parts[1];
    const expectedSig = createHash("sha256").update(payload + (process.env.JWT_SECRET || "ktk-secret")).digest("hex");
    if (sig !== expectedSig) return null;
    return payload.split(":")[0]; // email
  } catch {
    return null;
  }
}

export async function verifyLogin(email: string, password: string): Promise<boolean> {
  const hash = hashPassword(password);
  const rows = await sql(`SELECT id FROM admin_users WHERE email = $1 AND password_hash = $2`, [email, hash]);
  return rows.length > 0;
}

export function getAuthToken(request: Request): string | null {
  const auth = request.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) {
    return auth.slice(7);
  }
  return null;
}
