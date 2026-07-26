"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [authed, setAuthed] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === "/adminpanel/login") {
      setLoading(false);
      return;
    }
    
    // Try to verify with cookie (automatic) first, fall back to localStorage token
    fetch("/api/admin/verify", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        if (data.valid) {
          setAuthed(true);
          setLoading(false);
        } else {
          // Try localStorage token as fallback
          const token = localStorage.getItem("admin_token");
          if (token) {
            return fetch("/api/admin/verify", {
              headers: { Authorization: `Bearer ${token}` },
            }).then((r) => r.json());
          }
          return { valid: false };
        }
      })
      .then((data) => {
        if (data?.valid) {
          setAuthed(true);
        } else {
          localStorage.removeItem("admin_token");
          router.push("/adminpanel/login");
        }
      })
      .catch(() => {
        router.push("/adminpanel/login");
      })
      .finally(() => setLoading(false));
  }, [pathname, router]);

  if (pathname === "/adminpanel/login") {
    return <>{children}</>;
  }

  if (loading) {
    return <div style={{ padding: 50, textAlign: "center" }}>Завантаження...</div>;
  }

  if (!authed) {
    return null;
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <nav style={{ width: 220, background: "#1a1a2e", color: "#fff", padding: 20 }}>
        <h2 style={{ fontSize: 18, marginBottom: 20 }}>KTK Адмінка</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <a href="/adminpanel/dashboard" style={linkStyle}>📊 Дашборд</a>
          <a href="/adminpanel/products" style={linkStyle}>📦 Товари</a>
          <a href="/adminpanel/services" style={linkStyle}>🔧 Послуги</a>
          <a href="/adminpanel/reviews" style={linkStyle}>⭐ Відгуки</a>
          <a href="/adminpanel/settings" style={linkStyle}>⚙️ Налаштування</a>
          <hr style={{ borderColor: "#333", margin: "15px 0" }} />
          <button
            onClick={() => { localStorage.removeItem("admin_token"); localStorage.removeItem("admin_email"); window.location.href = "/adminpanel/login"; }}
            style={{ ...linkStyle, background: "none", border: "none", cursor: "pointer", textAlign: "left", color: "#ff6b6b" }}
          >
            🚪 Вийти
          </button>
        </div>
      </nav>
      <main style={{ flex: 1, padding: 30, background: "#f5f5f5" }}>
        {children}
      </main>
    </div>
  );
}

const linkStyle: React.CSSProperties = {
  color: "#ccc",
  textDecoration: "none",
  padding: "8px 12px",
  borderRadius: 6,
  fontSize: 15,
};
