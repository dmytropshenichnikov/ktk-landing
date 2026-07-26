"use client";
import { useEffect, useState } from "react";

export default function ApplicationsAdmin() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : "";

  const load = async () => {
    const r = await fetch("/api/admin/content/applications", { headers: { Authorization: `Bearer ${token}` } });
    const data = await r.json();
    setItems(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  if (loading) return <p>Завантаження...</p>;

  return (
    <div>
      <h1>📋 Заявки</h1>
      <p>Всього: {items.length}</p>
      <div style={{ display: "grid", gap: 15, marginTop: 20 }}>
        {items.map((item: any) => (
          <div key={item.id} style={{ background: "#fff", padding: 15, borderRadius: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <strong>{item.name}</strong>
              <span style={{ color: "#999", fontSize: 13 }}>{new Date(item.created_at).toLocaleString("uk-UA")}</span>
            </div>
            <p>📞 {item.phone}</p>
            {item.email && <p>📧 {item.email}</p>}
            {item.product && <p>📦 {item.product}</p>}
            {item.message && <p>💬 {item.message}</p>}
            <span style={{ background: item.status === "new" ? "#e67e22" : "#2ecc71", color: "#fff", padding: "2px 10px", borderRadius: 12, fontSize: 12 }}>
              {item.status === "new" ? "Нова" : "Переглянуто"}
            </span>
          </div>
        ))}
        {items.length === 0 && <p style={{ color: "#999" }}>Поки що немає заявок</p>}
      </div>
    </div>
  );
}
