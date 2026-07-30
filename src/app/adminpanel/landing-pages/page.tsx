"use client";
import { useEffect, useState, useCallback } from "react";

type LandingPage = {
  id: number;
  slug: string;
  title: string;
  description: string;
  is_active: boolean;
  hero_title: string;
  hero_subtitle: string;
  hero_label: string;
  hero_points: string[];
  form_title: string;
  form_subtitle: string;
  form_button: string;
  form_success: string;
  section_products_label: string;
  section_products_title: string;
  section_services_label: string;
  section_reviews_label: string;
  section_reviews_title: string;
  contact_strip_label: string;
  contact_strip_title: string;
  contacts_label: string;
  contacts_title: string;
  created_at: string;
  updated_at: string;
};

const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : "";
const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

const FIELD_GROUPS = [
  {
    label: "Заголовок (Hero)",
    fields: [
      { key: "hero_label", label: "Мітка Hero" },
      { key: "hero_title", label: "Головний заголовок" },
      { key: "hero_subtitle", label: "Підзаголовок" },
      { key: "hero_points", label: "Пункти (кома)", type: "text" },
    ],
  },
  {
    label: "Форма заявки",
    fields: [
      { key: "form_title", label: "Заголовок форми" },
      { key: "form_subtitle", label: "Підпис форми" },
      { key: "form_button", label: "Кнопка" },
      { key: "form_success", label: "Повідомлення успіху" },
    ],
  },
  {
    label: "Секції",
    fields: [
      { key: "section_products_label", label: "Мітка товарів" },
      { key: "section_products_title", label: "Заголовок товарів" },
      { key: "section_services_label", label: "Мітка послуг" },
      { key: "section_reviews_label", label: "Мітка відгуків" },
      { key: "section_reviews_title", label: "Заголовок відгуків" },
    ],
  },
  {
    label: "Контакти",
    fields: [
      { key: "contact_strip_label", label: "Мітка контактної смуги" },
      { key: "contact_strip_title", label: "Заголовок контактної смуги" },
      { key: "contacts_label", label: "Мітка контактів" },
      { key: "contacts_title", label: "Заголовок контактів" },
    ],
  },
];

const INPUT_STYLE = { padding: "8px 10px", borderRadius: 6, border: "1px solid #d1d5db", fontSize: 13, width: "100%", boxSizing: "border-box" as const };

export default function LandingPagesPage() {
  const [pages, setPages] = useState<LandingPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [edit, setEdit] = useState<Partial<LandingPage> | null>(null);
  const [isNew, setIsNew] = useState(false);

  const load = useCallback(async () => {
    try {
      const r = await fetch("/api/admin/content/landing-pages", { headers });
      setPages(Array.isArray(await r.json()) ? await r.json() : []);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    if (!edit) return;
    try {
      if (isNew) {
        await fetch("/api/admin/content/landing-pages", {
          method: "POST", headers,
          body: JSON.stringify({ ...edit, slug: edit.slug || edit.title?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") }),
        });
      } else if (edit.id) {
        await fetch("/api/admin/content/landing-pages", {
          method: "PUT", headers,
          body: JSON.stringify(edit),
        });
      }
      setEdit(null);
      setIsNew(false);
      load();
    } catch {}
  };

  const clone = async (page: LandingPage) => {
    try {
      const slug = `${page.slug}-copy-${Date.now().toString(36)}`;
      await fetch("/api/admin/content/landing-pages", {
        method: "POST", headers,
        body: JSON.stringify({ ...page, id: undefined, slug, title: `${page.title} (копія)` }),
      });
      load();
    } catch {}
  };

  const remove = async (id: number) => {
    if (!confirm("Видалити цю сторінку?")) return;
    try {
      await fetch(`/api/admin/content/landing-pages?id=${id}`, { method: "DELETE", headers });
      load();
    } catch {}
  };

  const toggle = async (id: number, active: boolean) => {
    try {
      await fetch("/api/admin/content/landing-pages", {
        method: "PUT", headers,
        body: JSON.stringify({ id, is_active: active }),
      });
      load();
    } catch {}
  };

  if (loading) return <p>Завантаження...</p>;

  if (edit) {
    return (
      <div style={{ maxWidth: 800 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h1 style={{ margin: 0, fontSize: 20 }}>{isNew ? "Нова сторінка" : "Редагувати: " + edit.title}</h1>
          <button onClick={() => { setEdit(null); setIsNew(false); }}
            style={{ padding: "8px 16px", borderRadius: 6, border: "1px solid #d1d5db", background: "#fff", cursor: "pointer", fontSize: 13 }}>
            Назад
          </button>
        </div>

        <div style={{ background: "#fff", borderRadius: 12, padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,.06)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
            <div>
              <label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 4 }}>Назва сторінки *</label>
              <input value={edit.title || ""} onChange={e => setEdit({ ...edit, title: e.target.value })}
                placeholder="Наприклад: Реклама Google" style={INPUT_STYLE} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 4 }}>URL (slug) *</label>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ fontSize: 12, color: "#bbb" }}>/landing/</span>
                <input value={edit.slug || ""} onChange={e => setEdit({ ...edit, slug: e.target.value })}
                  placeholder="reklama-google" style={INPUT_STYLE} />
              </div>
            </div>
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 4 }}>Опис</label>
            <textarea value={edit.description || ""} onChange={e => setEdit({ ...edit, description: e.target.value })}
              rows={2} style={{ ...INPUT_STYLE, resize: "vertical" }} />
          </div>

          {FIELD_GROUPS.map(group => (
            <div key={group.label} style={{ marginBottom: 20 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, margin: "0 0 10px", color: "#333" }}>{group.label}</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {group.fields.map(f => (
                  <div key={f.key}>
                    <label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 4 }}>{f.label}</label>
                    {f.type === "textarea" ? (
                      <textarea value={(edit as any)[f.key] || ""} onChange={e => setEdit({ ...edit, [f.key]: e.target.value })}
                        rows={3} style={{ ...INPUT_STYLE, resize: "vertical" }} />
                    ) : f.type === "text" ? (
                      <input value={Array.isArray((edit as any)[f.key]) ? (edit as any)[f.key].join(", ") : (edit as any)[f.key] || ""}
                        onChange={e => setEdit({ ...edit, [f.key]: e.target.value.split(",").map((s: string) => s.trim()).filter(Boolean) })}
                        style={INPUT_STYLE} placeholder="пункт1, пункт2, пункт3" />
                    ) : (
                      <input value={(edit as any)[f.key] || ""} onChange={e => setEdit({ ...edit, [f.key]: e.target.value })} style={INPUT_STYLE} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
          <button onClick={save} style={{ padding: "10px 24px", borderRadius: 8, border: "none", background: "#22c55e", color: "#fff", cursor: "pointer", fontWeight: 600, fontSize: 14 }}>
            {isNew ? "Створити сторінку" : "Зберегти"}
          </button>
          <button onClick={() => { setEdit(null); setIsNew(false); }}
            style={{ padding: "10px 24px", borderRadius: 8, border: "1px solid #d1d5db", background: "#fff", cursor: "pointer", fontSize: 14 }}>
            Скасувати
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 20 }}>Лендінги</h1>
          <p style={{ margin: "4px 0 0", color: "#888", fontSize: 13 }}>
            Створюйте різні версії лендінгу для різних джерел трафіку
          </p>
        </div>
        <button onClick={() => { setIsNew(true); setEdit({ title: "", slug: "", description: "", is_active: true, hero_title: "", hero_subtitle: "", hero_label: "", hero_points: [], form_title: "", form_subtitle: "", form_button: "", form_success: "", section_products_label: "", section_products_title: "", section_services_label: "", section_reviews_label: "", section_reviews_title: "", contact_strip_label: "", contact_strip_title: "", contacts_label: "", contacts_title: "" }); }}
          style={{ padding: "10px 20px", borderRadius: 8, border: "none", background: "#22c55e", color: "#fff", cursor: "pointer", fontWeight: 600, fontSize: 14 }}>
          + Нова сторінка
        </button>
      </div>

      {pages.length === 0 ? (
        <div style={{ background: "#fff", borderRadius: 12, padding: 60, textAlign: "center", boxShadow: "0 1px 3px rgba(0,0,0,.06)" }}>
          <p style={{ fontSize: 14, color: "#999" }}>Ще немає жодної сторінки. Створіть першу!</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {pages.map((page) => (
            <div key={page.id} style={{ background: "#fff", borderRadius: 12, padding: "16px 20px", boxShadow: "0 1px 3px rgba(0,0,0,.06)", borderLeft: page.is_active ? "4px solid #22c55e" : "4px solid #d1d5db" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <strong style={{ fontSize: 16 }}>{page.title}</strong>
                    <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 10, background: page.is_active ? "#dcfce7" : "#f3f4f6", color: page.is_active ? "#16a34a" : "#888" }}>
                      {page.is_active ? "Активна" : "Неактивна"}
                    </span>
                  </div>
                  <a href={`/landing/${page.slug}`} target="_blank" style={{ fontSize: 12, color: "#2563eb", textDecoration: "none" }}>
                    /landing/{page.slug} ↗
                  </a>
                  {page.description && <p style={{ margin: "4px 0 0", fontSize: 13, color: "#888" }}>{page.description}</p>}
                </div>

                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={() => { setEdit(page); setIsNew(false); }}
                    style={{ padding: "6px 14px", borderRadius: 6, border: "1px solid #d1d5db", background: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 500 }}>
                    Редагувати
                  </button>
                  <button onClick={() => clone(page)}
                    style={{ padding: "6px 14px", borderRadius: 6, border: "1px solid #d1d5db", background: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 500 }}>
                    Копіювати
                  </button>
                  <button onClick={() => toggle(page.id, !page.is_active)}
                    style={{ padding: "6px 14px", borderRadius: 6, border: "1px solid #d1d5db", background: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 500 }}>
                    {page.is_active ? "Деактивувати" : "Активувати"}
                  </button>
                  <button onClick={() => remove(page.id)}
                    style={{ padding: "6px 14px", borderRadius: 6, border: "1px solid #dc2626", background: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 500, color: "#dc2626" }}>
                    Видалити
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
