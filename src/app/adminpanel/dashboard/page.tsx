"use client";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const [stats, setStats] = useState<any>({
    products: 0,
    services: 0,
    reviews: 0,
    settings: 0,
  });

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    const headers = { Authorization: `Bearer ${token}` };
    
    Promise.all([
      fetch("/api/admin/content/products", { headers }).then(r => r.json()).catch(() => []),
      fetch("/api/admin/content/services", { headers }).then(r => r.json()).catch(() => []),
      fetch("/api/admin/content/reviews", { headers }).then(r => r.json()).catch(() => []),
      fetch("/api/admin/content/settings", { headers }).then(r => r.json()).catch(() => []),
    ]).then(([products, services, reviews, settings]) => {
      setStats({
        products: Array.isArray(products) ? products.length : 0,
        services: Array.isArray(services) ? services.length : 0,
        reviews: Array.isArray(reviews) ? reviews.length : 0,
        settings: Array.isArray(settings) ? settings.length : 0,
        total: (Array.isArray(products) ? products.length : 0) +
               (Array.isArray(services) ? services.length : 0) +
               (Array.isArray(reviews) ? reviews.length : 0),
      });
    });
  }, []);

  const cards = [
    { label: "Товари", value: stats.products, color: "#3b82f6", bg: "#eff6ff", href: "/adminpanel/products" },
    { label: "Послуги", value: stats.services, color: "#8b5cf6", bg: "#f5f3ff", href: "/adminpanel/services" },
    { label: "Відгуки", value: stats.reviews, color: "#f59e0b", bg: "#fffbeb", href: "/adminpanel/reviews" },
    { label: "Налаштування", value: stats.settings, color: "#06b6d4", bg: "#ecfeff", href: "/adminpanel/settings" },
    { label: "Всього в БД", value: stats.total, color: "#22c55e", bg: "#f0fdf4", href: "/adminpanel/products" },
  ];

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24 }}>Дашборд</h1>
      
      {stats.total === 0 && (
        <div style={{ background: "#fef3c7", padding: 16, borderRadius: 12, marginBottom: 24, border: "1px solid #f59e0b" }}>
          База даних порожня. Зайди в <strong>Товари</strong>, <strong>Послуги</strong> або <strong>Відгуки</strong>
          {" "}і натисни <strong>"Завантажити з файлів у БД"</strong>.
        </div>
      )}

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
        gap: 16,
      }}>
        {cards.map((card) => (
          <a key={card.label} href={card.href}
            style={{
              background: card.bg, padding: "20px 24px", borderRadius: 16,
              textDecoration: "none", transition: "transform 0.2s, box-shadow 0.2s",
              display: "block",
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}
          >
            <p style={{ fontSize: 14, color: "#666", margin: "0 0 8px 0", fontWeight: 500 }}>{card.label}</p>
            <p style={{ fontSize: 36, fontWeight: 700, color: card.color, margin: 0 }}>{card.value}</p>
          </a>
        ))}
      </div>

      <div style={{ marginTop: 32, display: "flex", gap: 12, flexWrap: "wrap" }}>
        {[
          { href: "/adminpanel/products", label: "Керувати товарами" },
          { href: "/adminpanel/services", label: "Керувати послугами" },
          { href: "/adminpanel/reviews", label: "Керувати відгуками" },
          { href: "/adminpanel/settings", label: "Налаштування сайту" },
        ].map((link) => (
          <a key={link.href} href={link.href}
            style={{
              padding: "10px 20px", borderRadius: 10, background: "#fff",
              color: "#333", textDecoration: "none", fontSize: 14, fontWeight: 500,
              border: "1px solid #e5e7eb", transition: "all 0.2s",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "#22c55e"; e.currentTarget.style.color = "#22c55e"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "#e5e7eb"; e.currentTarget.style.color = "#333"; }}
          >
            {link.label} →
          </a>
        ))}
      </div>
    </div>
  );
}
