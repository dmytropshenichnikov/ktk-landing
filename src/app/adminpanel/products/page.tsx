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

  const seed = async () => {
    const r = await fetch("/api/seed");
    const d = await r.json();
    alert("Дані завантажено! " + JSON.stringify(d.count));
    load();
  };

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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h1 style={{ margin: 0 }}>Товари</h1>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={seed} style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: "#f59e0b", color: "#fff", cursor: "pointer", fontWeight: "bold" }}>
            Завантажити з файлів у БД
          </button>
          <button onClick={load} style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: "#6b7280", color: "#fff", cursor: "pointer" }}>
            Оновити
          </button>
        </div>
      </div>

      {items.length === 0 && (
        <div style={{ background: "#fef3c7", padding: 16, borderRadius: 12, marginBottom: 20, border: "1px solid #f59e0b" }}>
          База даних порожня. Натисни <strong>"Завантажити з файлів у БД"</strong> щоб перенести товари з файлів.
        </div>
      )}

      <button onClick={() => setEdit({ slug: "", name: "", spec: "", price_from: "", description: "", image: "/photos/", details: [], sort_order: 0 })} style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: "#22c55e", color: "#fff", cursor: "pointer", fontWeight: "bold", marginBottom: 20 }}>
        + Додати товар
      </button>

      {edit && (
        <div style={{ background: "#fff", padding: 20, borderRadius: 12, margin: "20px 0" }}>
          <h3>{edit.id ? "Редагувати" : "Новий"} товар</h3>
          <div style={{ display: "grid", gap: 10, gridTemplateColumns: "1fr 1fr" }}>
            <input placeholder="Назва" value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} style={inpStyle} />
            <input placeholder="Специфікація" value={edit.spec} onChange={(e) => setEdit({ ...edit, spec: e.target.value })} style={inpStyle} />
            <input placeholder="Ціна від" value={edit.price_from} onChange={(e) => setEdit({ ...edit, price_from: e.target.value })} style={inpStyle} />
            <div>
              <label style={{ display: "block", fontSize: 13, color: "#666", marginBottom: 4 }}>Фото</label>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input placeholder="Шлях або завантажте фото" value={edit.image} onChange={(e) => setEdit({ ...edit, image: e.target.value })} style={{ ...inpStyle, flex: 1 }} />
                <label style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #ccc", cursor: "pointer", fontSize: 13, background: "#f9f9f9", whiteSpace: "nowrap" }}>
                  📷 Завантажити
                  <input type="file" accept="image/*" hidden onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const fd = new FormData();
                    fd.append("file", file);
                    fd.append("folder", "photos");
                    const r = await fetch("/api/upload", { method: "POST", body: fd });
                    const d = await r.json();
                    if (d.url) setEdit({ ...edit, image: d.url });
                  }} />
                </label>
              </div>
              {edit.image && edit.image !== "/photos/" && (
                <img src={edit.image} alt="preview" style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 8, marginTop: 6, border: "1px solid #eee" }} />
              )}
            </div>
            <input placeholder="Slug (напр. shheben)" value={edit.slug} onChange={(e) => setEdit({ ...edit, slug: e.target.value })} style={inpStyle} />
            <input placeholder="Порядок" type="number" value={edit.sort_order} onChange={(e) => setEdit({ ...edit, sort_order: parseInt(e.target.value) || 0 })} style={inpStyle} />
          </div>
          <textarea placeholder="Опис" value={edit.description} onChange={(e) => setEdit({ ...edit, description: e.target.value })}
            style={{ ...inpStyle, width: "100%", marginTop: 10, minHeight: 60 }} />
          <div style={{ marginTop: 10, display: "flex", gap: 10 }}>
            <button onClick={save} style={{ ...btnStyle, background: "#22c55e", color: "#fff" }}>Зберегти</button>
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
              <button onClick={() => setEdit(item)} style={{ ...btnStyle, background: "#3b82f6", color: "#fff" }}>Редагувати</button>
              <button onClick={() => del(item.id)} style={{ ...btnStyle, background: "#ef4444", color: "#fff" }}>Видалити</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const btnStyle: React.CSSProperties = { padding: "8px 16px", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: "bold", fontSize: 14 };
const inpStyle: React.CSSProperties = { padding: 10, borderRadius: 8, border: "1px solid #ccc", fontSize: 14 };
