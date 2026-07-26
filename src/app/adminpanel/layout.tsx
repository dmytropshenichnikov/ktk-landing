"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/adminpanel/dashboard", label: "Дашборд" },
  { href: "/adminpanel/products", label: "Товари" },
  { href: "/adminpanel/services", label: "Послуги" },
  { href: "/adminpanel/reviews", label: "Відгуки" },
  { href: "/adminpanel/settings", label: "Налаштування" },
  { href: "/adminpanel/applications", label: "Заявки" },
];

const styles = {
  sidebar: {
    width: 260,
    background: "linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)",
    color: "#fff",
    display: "flex",
    flexDirection: "column" as const,
    position: "fixed" as const,
    top: 0, left: 0, bottom: 0,
    zIndex: 100,
    transition: "transform 0.3s",
  },
  overlay: {
    position: "fixed" as const,
    top: 0, left: 0, right: 0, bottom: 0,
    background: "rgba(0,0,0,0.5)",
    zIndex: 99,
  },
  hamburger: {
    display: "none",
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 4,
  },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [authed, setAuthed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 900);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

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

  useEffect(() => { setSidebarOpen(false); }, [pathname]);

  if (pathname === "/adminpanel/login") return <>{children}</>;
  if (loading) return <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", color: "#666" }}>Завантаження...</div>;
  if (!authed) return null;

  const sidebarVisible = !isMobile || sidebarOpen;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f0f2f5" }}>
      {/* Overlay for mobile */}
      {isMobile && sidebarOpen && <div style={styles.overlay} onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside style={{
        ...styles.sidebar,
        transform: isMobile ? (sidebarOpen ? "translateX(0)" : "translateX(-100%)") : "translateX(0)",
      }}>
        <div style={{ padding: "20px 16px", borderBottom: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" style={{ display: "inline-block", verticalAlign: "middle", marginRight: 8 }}>
              <path d="M12 2L2 7l10 5 10-5-10-5z" fill="#4ade80"/>
              <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="#4ade80" strokeWidth="2" fill="none"/>
            </svg>
            <span style={{ fontSize: 17, fontWeight: 700, verticalAlign: "middle" }}>KTK Admin</span>
          </div>
          {isMobile && (
            <button onClick={() => setSidebarOpen(false)} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", fontSize: 20 }}>✕</button>
          )}
        </div>

        <nav style={{ flex: 1, padding: "8px 6px" }}>
          {NAV_ITEMS.map(item => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <a key={item.href} href={item.href} onClick={(e) => { e.preventDefault(); router.push(item.href); }}
                style={{
                  display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
                  borderRadius: 8, marginBottom: 1, textDecoration: "none",
                  fontSize: 14, fontWeight: isActive ? 600 : 400,
                  background: isActive ? "rgba(255,255,255,0.12)" : "transparent",
                  color: isActive ? "#fff" : "rgba(255,255,255,0.7)",
                }}
              >
                {item.label}
              </a>
            );
          })}
        </nav>

        <div style={{ padding: "8px 6px", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
          <button onClick={() => { localStorage.removeItem("admin_token"); localStorage.removeItem("admin_email"); window.location.href = "/adminpanel/login"; }}
            style={{
              display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", width: "100%",
              borderRadius: 8, border: "none", background: "transparent",
              color: "rgba(255,255,255,0.6)", cursor: "pointer", fontSize: 14,
            }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
            </svg>
            Вийти
          </button>
        </div>
      </aside>

      {/* Main */}
      <div style={{
        marginLeft: isMobile ? 0 : 260,
        flex: 1, minHeight: "100vh", width: isMobile ? "100%" : "auto",
      }}>
        {/* Mobile Header */}
        <header style={{
          background: "#fff", padding: "12px 16px", borderBottom: "1px solid #e5e7eb",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          position: "sticky", top: 0, zIndex: 50,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {isMobile && (
              <button onClick={() => setSidebarOpen(true)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2">
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              </button>
            )}
            <h2 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>
              {NAV_ITEMS.find(i => pathname.startsWith(i.href))?.label || "Адмін-панель"}
            </h2>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {!isMobile && (
              <span style={{ fontSize: 13, color: "#666" }}>
                {typeof window !== "undefined" ? localStorage.getItem("admin_email") : ""}
              </span>
            )}
            <div style={{
              width: 30, height: 30, borderRadius: "50%",
              background: "linear-gradient(135deg, #4ade80, #22c55e)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontWeight: 700, fontSize: 13,
            }}>A</div>
          </div>
        </header>

        {/* Content */}
        <div style={{ padding: isMobile ? 12 : 24 }}>
          {children}
        </div>
      </div>
    </div>
  );
}
