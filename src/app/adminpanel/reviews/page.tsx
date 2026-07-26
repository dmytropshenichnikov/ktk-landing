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

  const seed = async () => {
    const r = await fetch("/api/seed");
    const d = await r.json();
    alert("Дані завантажено! " + JSON.stringify(d.count));
    load();
  };

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
    if (!confirm("Видалити відгук?")) return;
    await fetch(`/api/admin/content/reviews?id=${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
    load();
  };

  const uploadPhoto = async (file: File) => {
    const fd = new FormData(); fd.append("file", file); fd.append("folder", "reviews");
    const r = await fetch("/api/upload", { method: "POST", body: fd });
    const d = await r.json();
    if (d.url) setEdit({ ...edit, image: d.url });
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 8 }}>
        <h1 style={{ margin: 0, fontSize: 22 }}>Відгуки</h1>
        <button onClick={seed} style={btnYellow}>Завантажити з файлів у БД</button>
      </div>

      {items.length === 0 && !loading && (
        <div style={emptyBox}>База даних порожня. Натисни <strong>"Завантажити з файлів у БД"</strong>.</div>
      )}

      <button onClick={() => setEdit({ name: "", role: "", text: "", image: "", sort_order: 0 })} style={btnGreen}>
        + Додати відгук
      </button>

      {edit && (
        <div style={modalOverlay} onClick={() => setEdit(null)}>
          <div style={modalContent} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ margin: 0 }}>{edit.id ? "Редагувати відгук" : "Новий відгук"}</h3>
              <button onClick={() => setEdit(null)} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#999" }}>✕</button>
            </div>

            <div style={fieldGrid}>
              <div style={fieldCell}>
                <label style={label}>Ім'я</label>
                <input value={edit.name} onChange={e => setEdit({ ...edit, name: e.target.value })} style={input} placeholder="Олександр Мельник" />
              </div>
              <div style={fieldCell}>
                <label style={label}>Роль</label>
                <input value={edit.role} onChange={e => setEdit({ ...edit, role: e.target.value })} style={input} placeholder="Приватне будівництво" />
              </div>
              <div style={fieldCell}>
                <label style={label}>Порядок</label>
                <input type="number" value={edit.sort_order} onChange={e => setEdit({ ...edit, sort_order: parseInt(e.target.value) || 0 })} style={input} />
              </div>
              <div style={fieldCell}>
                <label style={label}>Фото</label>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <input value={edit.image} onChange={e => setEdit({ ...edit, image: e.target.value })} style={{ ...input, flex: 1 }} placeholder="/reviews/review-1.jpg" />
                  <label style={photoBtn}>
                    📷
                    <input type="file" accept="image/*" hidden onChange={e => { const f = e.target.files?.[0]; if (f) uploadPhoto(f); }} />
                  </label>
                </div>
                {edit.image && <img src={edit.image} alt="" style={{ width: 60, height: 60, borderRadius: "50%", objectFit: "cover", marginTop: 8, border: "2px solid #eee" }} />}
              </div>
            </div>

            <div style={{ marginTop: 12 }}>
              <label style={label}>Текст відгуку</label>
              <textarea value={edit.text} onChange={e => setEdit({ ...edit, text: e.target.value })} style={{ ...input, minHeight: 100, width: "100%" }} placeholder="Текст відгуку..." />
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
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                {item.image ? (
                  <img src={item.image} alt="" style={{ width: 48, height: 48, borderRadius: "50%", objectFit: "cover", background: "#eee" }} />
                ) : (
                  <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#e5e7eb", display: "flex", alignItems: "center", justifyContent: "center", color: "#999" }}>👤</div>
                )}
                <div>
                  <strong>{item.name}</strong>
                  <div style={{ fontSize: 13, color: "#666" }}>{item.role}</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => setEdit(item)} style={btnBlue}>Ред.</button>
                <button onClick={() => del(item.id)} style={btnRed}>✕</button>
              </div>
            </div>
            <p style={{ marginTop: 10, color: "#555", fontSize: 14, lineHeight: 1.5 }}>{item.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

const label: React.CSSProperties = { display: "block", fontSize: 13, color: "#666", marginBottom: 4, fontWeight: 500 };
const input: React.CSSProperties = { padding: "10px 12px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 14, outline: "none", boxSizing: "border-box" };
const fieldGrid: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 12 };
const fieldCell: React.CSSProperties = { display: "flex", flexDirection: "column" };
const card: React.CSSProperties = { background: "#fff", padding: 16, borderRadius: 12, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" };
const emptyBox: React.CSSProperties = { background: "#fef3c7", padding: 16, borderRadius: 12, marginBottom: 16, border: "1px solid #f59e0b", fontSize: 14 };
const modalOverlay: React.CSSProperties = { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 };
const modalContent: React.CSSProperties = { background: "#fff", borderRadius: 16, padding: 24, maxWidth: 700, width: "100%", maxHeight: "90vh", overflow: "auto" };
const btnGreen: React.CSSProperties = { padding: "10px 20px", borderRadius: 8, border: "none", background: "#22c55e", color: "#fff", cursor: "pointer", fontWeight: 600, fontSize: 14 };
const btnBlue: React.CSSProperties = { padding: "6px 12px", borderRadius: 8, border: "none", background: "#3b82f6", color: "#fff", cursor: "pointer", fontSize: 13 };
const btnRed: React.CSSProperties = { padding: "6px 12px", borderRadius: 8, border: "none", background: "#ef4444", color: "#fff", cursor: "pointer", fontSize: 13 };
const btnGray: React.CSSProperties = { padding: "10px 20px", borderRadius: 8, border: "none", background: "#e5e7eb", color: "#333", cursor: "pointer", fontSize: 14 };
const btnYellow: React.CSSProperties = { padding: "8px 14px", borderRadius: 8, border: "none", background: "#f59e0b", color: "#fff", cursor: "pointer", fontWeight: 600, fontSize: 13 };
const photoBtn: React.CSSProperties = { padding: "8px 12px", borderRadius: 8, border: "1px solid #d1d5db", cursor: "pointer", fontSize: 18, background: "#f9f9f9" };
