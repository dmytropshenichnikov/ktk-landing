"use client";
import { useEffect, useState } from "react";
import { uploadPhoto } from "@/lib/upload";

export default function ProductsAdmin() {
  const [items, setItems] = useState<any[]>([]);
  const [edit, setEdit] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
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
    if (!confirm("Видалити товар?")) return;
    await fetch(`/api/admin/content/products?id=${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
    load();
  };

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const url = await uploadPhoto(file, "photos");
      setEdit({ ...edit, image: url });
    } catch (e: any) {
      alert("Помилка завантаження: " + e.message);
    }
    setUploading(false);
  };

  const addDetail = () => setEdit({ ...edit, details: [...(edit.details || []), ""] });
  const updateDetail = (i: number, val: string) => {
    const d = [...(edit.details || [])]; d[i] = val; setEdit({ ...edit, details: d });
  };
  const removeDetail = (i: number) => {
    setEdit({ ...edit, details: (edit.details || []).filter((_: any, idx: number) => idx !== i) });
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 8 }}>
        <h1 style={{ margin: 0, fontSize: 22 }}>Товари</h1>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button onClick={seed} style={btnYellow}>Завантажити з файлів у БД</button>
          <button onClick={load} style={btnGray}>Оновити</button>
        </div>
      </div>

      {items.length === 0 && !loading && (
        <div style={emptyBox}>База даних порожня. Натисни <strong>"Завантажити з файлів у БД"</strong> щоб перенести товари.</div>
      )}

      <button onClick={() => setEdit({ slug: "", name: "", spec: "", price_from: "", description: "", image: "", details: [], sort_order: 0 })} style={btnGreen}>
        + Додати товар
      </button>

      {edit && (
        <div style={modalOverlay} onClick={() => setEdit(null)}>
          <div style={modalContent} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ margin: 0 }}>{edit.id ? "Редагувати товар" : "Новий товар"}</h3>
              <button onClick={() => setEdit(null)} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#999" }}>✕</button>
            </div>

            <div style={fieldGrid}>
              <div style={fieldCell}>
                <label style={label}>Назва</label>
                <input value={edit.name} onChange={e => setEdit({ ...edit, name: e.target.value })} style={input} placeholder="Щебінь" />
              </div>
              <div style={fieldCell}>
                <label style={label}>Специфікація</label>
                <input value={edit.spec} onChange={e => setEdit({ ...edit, spec: e.target.value })} style={input} placeholder="Фракції 5-20, 20-40, 40-70 мм" />
              </div>
              <div style={fieldCell}>
                <label style={label}>Ціна від</label>
                <input value={edit.price_from} onChange={e => setEdit({ ...edit, price_from: e.target.value })} style={input} placeholder="від 1200 грн/т" />
              </div>
              <div style={fieldCell}>
                <label style={label}>Slug</label>
                <input value={edit.slug} onChange={e => setEdit({ ...edit, slug: e.target.value })} style={input} placeholder="shheben" />
              </div>
              <div style={fieldCell}>
                <label style={label}>Порядок</label>
                <input type="number" value={edit.sort_order} onChange={e => setEdit({ ...edit, sort_order: parseInt(e.target.value) || 0 })} style={input} />
              </div>
              <div style={fieldCell}>
                <label style={label}>Фото</label>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <input value={edit.image} onChange={e => setEdit({ ...edit, image: e.target.value })} style={{ ...input, flex: 1 }} placeholder="Вставте URL або завантажте фото" />
                  <label style={{
                    ...photoBtn, opacity: uploading ? 0.5 : 1, pointerEvents: uploading ? "none" : "auto" as any,
                  }}>
                    {uploading ? "⏳" : "📷"}
                    <input type="file" accept="image/*" hidden disabled={uploading} onChange={e => { const f = e.target.files?.[0]; if (f) handleUpload(f); }} />
                  </label>
                </div>
                {edit.image && (
                  <div style={{ marginTop: 8, position: "relative" }}>
                    <img src={edit.image} alt="" style={{ width: "100%", maxHeight: 200, objectFit: "contain", borderRadius: 8, background: "#f5f5f5" }} />
                    <button onClick={() => setEdit({ ...edit, image: "" })} style={{ position: "absolute", top: 4, right: 4, background: "rgba(0,0,0,0.5)", color: "#fff", border: "none", borderRadius: "50%", width: 24, height: 24, cursor: "pointer" }}>✕</button>
                  </div>
                )}
              </div>
            </div>

            <div style={{ marginTop: 12 }}>
              <label style={label}>Опис</label>
              <textarea value={edit.description} onChange={e => setEdit({ ...edit, description: e.target.value })} style={{ ...input, minHeight: 60, width: "100%" }} placeholder="Для бетону, підсипки, дренажу..." />
            </div>

            <div style={{ marginTop: 12 }}>
              <label style={label}>Матеріали / деталі</label>
              {(edit.details || []).map((d: string, i: number) => (
                <div key={i} style={{ display: "flex", gap: 6, marginBottom: 4 }}>
                  <input value={d} onChange={e => updateDetail(i, e.target.value)} style={{ ...input, flex: 1 }} placeholder="Навалом і з доставкою" />
                  <button onClick={() => removeDetail(i)} style={{ ...btnGray, padding: "6px 10px" }}>✕</button>
                </div>
              ))}
              <button onClick={addDetail} style={{ ...btnGray, fontSize: 13, marginTop: 4 }}>+ Додати матеріал</button>
            </div>

            <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
              <button onClick={save} style={{ ...btnGreen, flex: 1 }}>Зберегти</button>
              <button onClick={() => setEdit(null)} style={{ ...btnGray, flex: 1 }}>Скасувати</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
        {items.map((item: any) => (
          <div key={item.id} style={card}>
            <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
              {item.image && <img src={item.image} alt="" style={{ width: 60, height: 60, borderRadius: 8, objectFit: "cover", background: "#eee" }} />}
              <div style={{ flex: 1, minWidth: 0 }}>
                <strong>{item.name}</strong>
                <div style={{ fontSize: 13, color: "#666" }}>{item.price_from} — {item.spec}</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <button onClick={() => setEdit(item)} style={btnBlue}>Редагувати</button>
              <button onClick={() => del(item.id)} style={btnRed}>Видалити</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const st = (base: React.CSSProperties): React.CSSProperties => base;
const label: React.CSSProperties = { display: "block", fontSize: 13, color: "#666", marginBottom: 4, fontWeight: 500 };
const input: React.CSSProperties = { padding: "10px 12px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 14, outline: "none", boxSizing: "border-box" };
const fieldGrid: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 12 };
const fieldCell: React.CSSProperties = { display: "flex", flexDirection: "column" };
const card: React.CSSProperties = { background: "#fff", padding: 16, borderRadius: 12, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" };
const emptyBox: React.CSSProperties = { background: "#fef3c7", padding: 16, borderRadius: 12, marginBottom: 16, border: "1px solid #f59e0b", fontSize: 14 };
const modalOverlay: React.CSSProperties = { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 };
const modalContent: React.CSSProperties = { background: "#fff", borderRadius: 16, padding: 24, maxWidth: 700, width: "100%", maxHeight: "90vh", overflow: "auto" };
const btnGreen: React.CSSProperties = { padding: "10px 20px", borderRadius: 8, border: "none", background: "#22c55e", color: "#fff", cursor: "pointer", fontWeight: 600, fontSize: 14 };
const btnBlue: React.CSSProperties = { padding: "8px 14px", borderRadius: 8, border: "none", background: "#3b82f6", color: "#fff", cursor: "pointer", fontSize: 13 };
const btnRed: React.CSSProperties = { padding: "8px 14px", borderRadius: 8, border: "none", background: "#ef4444", color: "#fff", cursor: "pointer", fontSize: 13 };
const btnGray: React.CSSProperties = { padding: "8px 14px", borderRadius: 8, border: "none", background: "#e5e7eb", color: "#333", cursor: "pointer", fontSize: 13 };
const btnYellow: React.CSSProperties = { padding: "8px 14px", borderRadius: 8, border: "none", background: "#f59e0b", color: "#fff", cursor: "pointer", fontWeight: 600, fontSize: 13 };
const photoBtn: React.CSSProperties = { padding: "8px 12px", borderRadius: 8, border: "1px solid #d1d5db", cursor: "pointer", fontSize: 18, background: "#f9f9f9", display: "inline-flex", alignItems: "center", justifyContent: "center" };
