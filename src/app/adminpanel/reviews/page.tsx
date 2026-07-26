"use client";
import { useEffect, useState } from "react";

export default function ReviewsAdmin() {
  const [items, setItems] = useState<any[]>([]);
  const [edit, setEdit] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : "";

  const load = async () => {
    const r = await fetch("/api/admin/content/reviews", { headers: { Authorization: `Bearer ${token}` } });
    const data = await r.json();
    setItems(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    const method = edit.id ? "PUT" : "POST";
    await fetch("/api/admin/content/reviews", {
      method, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(edit),
    });
    setEdit(null);
    load();
  };

  const del = async (id: number) => {
    if (!confirm("Видалити?")) return;
    await fetch(`/api/admin/content/reviews?id=${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
    load();
  };

  if (loading) return <p>Завантаження...</p>;

  return (
    <div>
      <h1>⭐ Відгуки</h1>
      <button onClick={() => setEdit({ name: "", role: "", text: "", image: "/reviews/", sort_order: 0 })} style={btnStyle}>
        + Додати відгук
      </button>
      {edit && (
        <div style={{ background: "#fff", padding: 20, borderRadius: 12, margin: "20px 0" }}>
          <h3>{edit.id ? "Редагувати" : "Новий"} відгук</h3>
          <div style={{ display: "grid", gap: 10, gridTemplateColumns: "1fr 1fr" }}>
            <input placeholder="Ім'я" value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} style={inpStyle} />
            <input placeholder="Роль" value={edit.role} onChange={(e) => setEdit({ ...edit, role: e.target.value })} style={inpStyle} />
            <input placeholder="Шлях до фото" value={edit.image} onChange={(e) => setEdit({ ...edit, image: e.target.value })} style={inpStyle} />
            <input placeholder="Порядок" type="number" value={edit.sort_order} onChange={(e) => setEdit({ ...edit, sort_order: parseInt(e.target.value) || 0 })} style={inpStyle} />
          </div>
          <textarea placeholder="Текст відгуку" value={edit.text} onChange={(e) => setEdit({ ...edit, text: e.target.value })}
            style={{ ...inpStyle, width: "100%", marginTop: 10, minHeight: 80 }} />
          <div style={{ marginTop: 10, display: "flex", gap: 10 }}>
            <button onClick={save} style={{ ...btnStyle, background: "#1a6b3c", color: "#fff" }}>Зберегти</button>
            <button onClick={() => setEdit(null)} style={{ ...btnStyle, background: "#ccc" }}>Скасувати</button>
          </div>
        </div>
      )}
      <div style={{ display: "grid", gap: 15, marginTop: 20 }}>
        {items.map((item: any) => (
          <div key={item.id} style={{ background: "#fff", padding: 15, borderRadius: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div><strong>{item.name}</strong> — {item.role}</div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => setEdit(item)} style={{ ...btnStyle, background: "#3498db", color: "#fff" }}>✏️</button>
                <button onClick={() => del(item.id)} style={{ ...btnStyle, background: "#e74c3c", color: "#fff" }}>🗑️</button>
              </div>
            </div>
            <p style={{ marginTop: 8, color: "#555" }}>{item.text?.slice(0, 120)}...</p>
          </div>
        ))}
      </div>
    </div>
  );
}

const btnStyle: React.CSSProperties = { padding: "8px 16px", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: "bold", fontSize: 14 };
const inpStyle: React.CSSProperties = { padding: 10, borderRadius: 8, border: "1px solid #ccc", fontSize: 14 };
