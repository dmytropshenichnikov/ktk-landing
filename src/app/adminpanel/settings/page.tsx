"use client";
import { useEffect, useState } from "react";

const SETTINGS_KEYS = [
  { key: "company_name", label: "Назва компанії", default: "ТОВ \"КТК\"" },
  { key: "phone_display", label: "Телефон (відображення)", default: "050 304 4777" },
  { key: "phone_raw", label: "Телефон (сирий)", default: "+380503044777" },
  { key: "phone_display2", label: "Телефон 2 (відображення)", default: "066 110 2829" },
  { key: "phone_raw2", label: "Телефон 2 (сирий)", default: "+380661102829" },
  { key: "working_hours", label: "Графік роботи", default: "Пн-Сб: 08:00-18:00" },
  { key: "delivery_area", label: "Регіон доставки", default: "Полтава та область" },
  { key: "hero_title", label: "Заголовок Hero", default: "Сервіс із професійною доставкою будматеріалів" },
  { key: "hero_subtitle", label: "Підзаголовок Hero", default: "Щебінь, пісок, гранодсів, кільця колодязні та шлакоблок з доставкою по місту та області." },
  { key: "form_title", label: "Заголовок форми", default: "Залишити заявку" },
  { key: "form_subtitle", label: "Підзаголовок форми", default: "Напишіть, що потрібно привезти, і ми швидко зв'яжемося з вами." },
  { key: "form_button", label: "Кнопка форми", default: "Надіслати заявку" },
  { key: "form_success", label: "Повідомлення про успіх", default: "Заявку відправлено. Ми скоро зв'яжемося з вами." },
];

export default function SettingsAdmin() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : "";

  useEffect(() => {
    Promise.all(
      SETTINGS_KEYS.map(async (s) => {
        const r = await fetch(`/api/admin/content/settings?key=${s.key}`, { headers: { Authorization: `Bearer ${token}` } });
        const data = await r.json();
        return { key: s.key, value: data?.value || s.default };
      })
    ).then((results) => {
      const map: Record<string, string> = {};
      results.forEach((r) => { map[r.key] = r.value; });
      setValues(map);
    });
  }, []);

  const saveAll = async () => {
    setSaving(true);
    for (const [key, value] of Object.entries(values)) {
      await fetch("/api/admin/content/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ key, value }),
      });
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div>
      <h1>⚙️ Налаштування сайту</h1>
      <div style={{ display: "grid", gap: 15, marginTop: 20 }}>
        {SETTINGS_KEYS.map((s) => (
          <div key={s.key} style={{ background: "#fff", padding: 15, borderRadius: 12 }}>
            <label style={{ fontWeight: "bold", display: "block", marginBottom: 5 }}>{s.label}</label>
            <input
              value={values[s.key] || ""}
              onChange={(e) => setValues({ ...values, [s.key]: e.target.value })}
              style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ccc", fontSize: 14, boxSizing: "border-box" }}
            />
          </div>
        ))}
      </div>
      <button onClick={saveAll} disabled={saving} style={{
        marginTop: 20, padding: "12px 30px", borderRadius: 8, border: "none",
        background: "#1a6b3c", color: "#fff", fontSize: 16, fontWeight: "bold", cursor: "pointer"
      }}>
        {saving ? "Збереження..." : saved ? "✅ Збережено!" : "Зберегти всі налаштування"}
      </button>
    </div>
  );
}
