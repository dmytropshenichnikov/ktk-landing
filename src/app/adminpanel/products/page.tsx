"use client";
import { useEffect, useState } from "react";

export default function ProductsAdmin() {
  const [items, setItems] = useState<any[]>([]);
  const [edit, setEdit] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : "";

  const load = async () => {
    const r = await fetch("/api/admin/content/products", { headers: { Authorization: `Bearer ${token}` } });
    const data = await r.json();
    setItems(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    const method = edit.id ? "PUT" : "POST";
    await fetch("/api/admin/content/products", {
      method, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(edit),
    });
    setEdit(null);
    load();
  };

  const del = async (id: number) => {
    if (!confirm("Видалити?")) return;
    await fetch(`/api/admin/content/products?id=${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
    load();
  };

  if (loading) return <p>Завантаження...</p>;

  return (
    <div>
      <h1>📦 Товари</h1>
      <button onClick={() => setEdit({ slug: "", name: "", spec: "", price_from: "", description: "", image: "/photos/", details: [], sort_order: 0 })} style={btnStyle}>
        + Додати товар
      </button>

      {edit && (
        <div style={{ background: "#fff", padding: 20, borderRadius: 12, margin: "20px 0" }}>
          <h3>{edit.id ? "Редагувати" : "Новий"} товар</h3>
          <div style={{ display: "grid", gap: 10, gridTemplateColumns: "1fr 1fr" }}>
            <input placeholder="Назва" value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} style={inpStyle} />
            <input placeholder="Специфікація" value={edit.spec} onChange={(e) => setEdit({ ...edit, spec: e.target.value })} style={inpStyle} />
            <input placeholder="Ціна від" value={edit.price_from} onChange={(e) => setEdit({ ...edit, price_from: e.target.value })} style={inpStyle} />
            <input placeholder="Шлях до фото" value={edit.image} onChange={(e) => setEdit({ ...edit, image: e.target.value })} style={inpStyle} />
            <input placeholder="Slug" value={edit.slug} onChange={(e) => setEdit({ ...edit, slug: e.target.value })} style={inpStyle} />
            <input placeholder="Порядок" type="number" value={edit.sort_order} onChange={(e) => setEdit({ ...edit, sort_order: parseInt(e.target.value) || 0 })} style={inpStyle} />
          </div>
          <textarea placeholder="Опис" value={edit.description} onChange={(e) => setEdit({ ...edit, description: e.target.value })}
            style={{ ...inpStyle, width: "100%", marginTop: 10, minHeight: 60 }} />
          <div style={{ marginTop: 10, display: "flex", gap: 10 }}>
            <button onClick={save} style={{ ...btnStyle, background: "#1a6b3c", color: "#fff" }}>Зберегти</button>
            <button onClick={() => setEdit(null)} style={{ ...btnStyle, background: "#ccc" }}>Скасувати</button>
          </div>
        </div>
      )}

      <div style={{ display: "grid", gap: 15, marginTop: 20 }}>
        {items.map((item: any) => (
          <div key={item.id} style={{ background: "#fff", padding: 15, borderRadius: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <strong>{item.name}</strong> — {item.price_from}
              <br /><small>{item.spec}</small>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setEdit(item)} style={{ ...btnStyle, background: "#3498db", color: "#fff" }}>✏️</button>
              <button onClick={() => del(item.id)} style={{ ...btnStyle, background: "#e74c3c", color: "#fff" }}>🗑️</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const btnStyle: React.CSSProperties = { padding: "8px 16px", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: "bold", fontSize: 14 };
const inpStyle: React.CSSProperties = { padding: 10, borderRadius: 8, border: "1px solid #ccc", fontSize: 14 };
