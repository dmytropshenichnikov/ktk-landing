"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/adminpanel/dashboard", label: "Дашборд", icon: "📊" },
  { href: "/adminpanel/products", label: "Товари", icon: "📦" },
  { href: "/adminpanel/services", label: "Послуги", icon: "🔧" },
  { href: "/adminpanel/reviews", label: "Відгуки", icon: "⭐" },
  { href: "/adminpanel/settings", label: "Налаштування", icon: "⚙️" },
  { href: "/adminpanel/applications", label: "Заявки", icon: "📋" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [authed, setAuthed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === "/adminpanel/login") {
      setLoading(false);
      return;
    }
    const token = localStorage.getItem("admin_token");
    if (!token) {
      router.push("/adminpanel/login");
      return;
    }
    fetch("/api/admin/verify?token=" + encodeURIComponent(token))
      .then(r => r.json())
      .then(data => {
        if (data.valid) setAuthed(true);
        else { localStorage.removeItem("admin_token"); router.push("/adminpanel/login"); }
      })
      .catch(() => { router.push("/adminpanel/login"); })
      .finally(() => setLoading(false));
  }, [pathname, router]);

  if (pathname === "/adminpanel/login") return <>{children}</>;
  if (loading) return <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", color: "#666" }}>Завантаження...</div>;
  if (!authed) return null;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f0f2f5" }}>
      {/* Sidebar */}
      <aside style={{
        width: 260, background: "linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)",
        color: "#fff", display: "flex", flexDirection: "column",
        position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 100,
        transform: sidebarOpen ? "translateX(0)" : "translateX(0)",
        transition: "transform 0.3s",
      }}>
        {/* Logo */}
        <div style={{ padding: "24px 20px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" style={{ display: "inline-block", verticalAlign: "middle", marginRight: 10 }}>
            <path d="M12 2L2 7l10 5 10-5-10-5z" fill="#4ade80"/>
            <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="#4ade80" strokeWidth="2" fill="none"/>
          </svg>
          <span style={{ fontSize: 18, fontWeight: 700, verticalAlign: "middle" }}>KTK Admin</span>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: "12px 8px" }}>
          {NAV_ITEMS.map(item => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <a key={item.href} href={item.href} onClick={(e) => { e.preventDefault(); router.push(item.href); }}
                style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "10px 14px",
                  borderRadius: 10, marginBottom: 2, textDecoration: "none",
                  fontSize: 14, fontWeight: isActive ? 600 : 400,
                  background: isActive ? "rgba(255,255,255,0.12)" : "transparent",
                  color: isActive ? "#fff" : "rgba(255,255,255,0.7)",
                  transition: "all 0.2s",
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
              >
                <span style={{ fontSize: 20 }}>{item.icon}</span>
                {item.label}
              </a>
            );
          })}
        </nav>

        {/* Logout */}
        <div style={{ padding: "12px 8px", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
          <button onClick={() => {
            localStorage.removeItem("admin_token");
            localStorage.removeItem("admin_email");
            window.location.href = "/adminpanel/login";
          }} style={{
            display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", width: "100%",
            borderRadius: 10, border: "none", background: "transparent",
            color: "rgba(255,255,255,0.6)", cursor: "pointer", fontSize: 14,
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
            </svg>
            Вийти
          </button>
        </div>
      </aside>

      {/* Main */}
      <div style={{ marginLeft: 260, flex: 1, minHeight: "100vh" }}>
        {/* Header */}
        <header style={{
          background: "#fff", padding: "16px 30px", borderBottom: "1px solid #e5e7eb",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, margin: 0 }}>
            {NAV_ITEMS.find(i => pathname.startsWith(i.href))?.label || "Адмін-панель"}
          </h2>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 13, color: "#666" }}>
              {typeof window !== "undefined" ? localStorage.getItem("admin_email") : ""}
            </span>
            <div style={{
              width: 32, height: 32, borderRadius: "50%",
              background: "linear-gradient(135deg, #4ade80, #22c55e)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontWeight: 700, fontSize: 14,
            }}>
              A
            </div>
          </div>
        </header>

        {/* Content */}
        <div style={{ padding: 24 }}>
          {children}
        </div>
      </div>
    </div>
  );
}
