"use client";
import { useEffect, useState } from "react";

export default function ApplicationsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    fetch("/api/admin/content/applications", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => {
        setItems(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <p>Завантаження...</p>;

  return (
    <div>
      <h1>📋 Заявки</h1>
      <p style={{ color: "#666", marginBottom: 20 }}>
        Заявки приходять в Telegram. Тут їх поки що немає.
      </p>
      {items.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60, color: "#999" }}>
          <p style={{ fontSize: 48, marginBottom: 10 }}>📭</p>
          <p>Заявки поки що не налаштовані для збереження в БД</p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 15, marginTop: 20 }}>
          {items.map((item: any) => (
            <div key={item.id} style={cardStyle}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <strong>{item.name}</strong>
                <span style={{ color: "#999", fontSize: 13 }}>
                  {item.created_at ? new Date(item.created_at).toLocaleString("uk-UA") : ""}
                </span>
              </div>
              <p style={{ margin: "4px 0" }}>📞 {item.phone}</p>
              {item.email && <p style={{ margin: "4px 0" }}>📧 {item.email}</p>}
              {item.product && <p style={{ margin: "4px 0" }}>📦 {item.product}</p>}
              {item.message && <p style={{ margin: "4px 0" }}>💬 {item.message}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const cardStyle: React.CSSProperties = {
  background: "#fff", padding: "16px 20px", borderRadius: 12,
  boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
};
