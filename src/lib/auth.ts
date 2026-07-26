import { createHash, randomBytes } from "crypto";
import sql from "./db";

const SECRET = process.env.JWT_SECRET || "ktk-secret";

export function hashPassword(password: string): string {
  return createHash("sha256").update(password).digest("hex");
}

// Simple encrypted token: base64( email + ":" + expiry + ":" + signature )
// where signature = sha256( email + ":" + expiry + ":" + secret )
export function generateToken(email: string): string {
  const expiry = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
  const data = `${email}:${expiry}`;
  const sig = createHash("sha256").update(data + ":" + SECRET).digest("hex").slice(0, 16);
  const token = Buffer.from(`${data}:${sig}`).toString("base64url");
  return token;
}

export function verifyToken(token: string): string | null {
  try {
    const decoded = Buffer.from(token, "base64url").toString();
    const lastColon = decoded.lastIndexOf(":");
    if (lastColon < 0) return null;
    
    const sig = decoded.slice(lastColon + 1);
    const data = decoded.slice(0, lastColon);
    
    const expectedSig = createHash("sha256").update(data + ":" + SECRET).digest("hex").slice(0, 16);
    if (sig !== expectedSig) return null;
    
    // Check expiry
    const parts = data.split(":");
    // parts[0] is email, parts[1] is timestamp
    const email = parts.slice(0, -1).join(":"); // In case email has colons
    const expiry = parseInt(parts[parts.length - 1]);
    if (isNaN(expiry) || Date.now() > expiry) return null;
    
    return email;
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
