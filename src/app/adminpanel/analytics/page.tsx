"use client";
import { useEffect, useState, useCallback } from "react";

/* ── Типи ─────────────────────────────────────────── */
type AnalyticsData = {
  total: number; today: number; thisWeek: number; lastWeek: number;
  byType: { event_type: string; count: number }[];
  byDay: { day: string; event_type: string; count: number }[];
  byHourOfDay: { hour: number; event_type: string; count: number }[];
  byDayOfWeek: { dow: number; day_name: string; event_type: string; count: number }[];
  byProduct: { event_data: string; count: number }[];
  appProducts: { product: string; count: number }[];
  appStatuses: { status: string; count: number }[];
  appsByDay: { day: string; count: number }[];
  phoneClicks: { event_data: string; count: number }[];
  utmStats: { source: string; medium: string; campaign: string; count: number }[];
  topReferrers: { referrer: string; count: number }[];
  pageViews: { page_url: string; count: number }[];
};

const LABELS: Record<string, string> = {
  click_phone: "Дзвінки", click_viber: "Viber", click_whatsapp: "WhatsApp",
  click_product: "Кліки товарів", click_service: "Кліки послуг",
  submit_application: "Заявки", page_view: "Перегляди",
};

const COLORS: Record<string, string> = {
  click_phone: "#2563eb", click_viber: "#7c3aed", click_whatsapp: "#16a34a",
  click_product: "#d97706", click_service: "#dc2626",
  submit_application: "#0891b2", page_view: "#4f46e5",
};

const DAYS_SHORT = ["Нд", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];
const DAYS_FULL  = ["Неділя", "Понеділок", "Вівторок", "Середа", "Четвер", "Пʼятниця", "Субота"];

function fmt(d: string) {
  return new Date(d).toLocaleDateString("uk-UA", { day: "numeric", month: "short" });
}
function pct(a: number, b: number) {
  return b > 0 ? Math.round((a / b) * 100) : 0;
}

/* ── Компонент ────────────────────────────────────── */
export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("month");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [evt, setEvt] = useState("");
  const [tab, setTab] = useState("overview");
  const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : "";

  const load = useCallback(async () => {
    setLoading(true);
    try {
      let url = `/api/admin/analytics?period=${period}`;
      if (from) url += `&from=${from}`;
      if (to) url += `&to=${to}`;
      if (evt) url += `&event=${evt}`;
      const r = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      setData(await r.json());
    } catch {}
    setLoading(false);
  }, [period, from, to, evt, token]);

  useEffect(() => { load(); }, [load]);

  /* агрегація для графіків */
  const agg = useCallback(() => {
    if (!data?.byDay) return [];
    const m: Record<string, Record<string, number>> = {};
    for (const e of data.byDay) {
      if (!m[e.day]) m[e.day] = {};
      m[e.day][e.event_type] = (m[e.day][e.event_type] || 0) + e.count;
    }
    return Object.entries(m).map(([d, v]) => ({ day: d, ...v })).sort((a, b) => a.day.localeCompare(b.day));
  }, [data]);

  const daily = agg();
  const types = [...new Set(data?.byDay?.map(e => e.event_type) || [])];
  const maxDay = Math.max(1, ...daily.map(d => types.reduce((s, t) => s + ((d as any)[t] || 0), 0)));

  /* годинна теплова карта */
  const hrs: Record<number, number> = {};
  for (let h = 0; h < 24; h++) hrs[h] = 0;
  if (data?.byHourOfDay) for (const e of data.byHourOfDay) hrs[e.hour] = (hrs[e.hour] || 0) + e.count;
  const maxHr = Math.max(1, ...Object.values(hrs));

  /* дні тижня */
  const dows: Record<number, number> = {};
  for (let d = 0; d < 7; d++) dows[d] = 0;
  if (data?.byDayOfWeek) for (const e of data.byDayOfWeek) dows[e.dow] = (dows[e.dow] || 0) + e.count;
  const maxDow = Math.max(1, ...Object.values(dows));

  const wkChg = data?.lastWeek ? Math.round(((data.thisWeek - data.lastWeek) / data.lastWeek) * 100) : 0;

  if (loading && !data) return (
    <div style={{ display: "flex", justifyContent: "center", padding: 100 }}>
      <div className="spinner" style={{ width: 36, height: 36, border: "4px solid #e5e7eb", borderTopColor: "#22c55e", borderRadius: "50%" }} />
      <style>{`.spinner { animation: spin .8s linear infinite } @keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );

  const C = (p: { bg?: string; pad?: number; mb?: number; children: any }) => (
    <div style={{ background: p.bg || "#fff", borderRadius: 12, padding: p.pad ?? 20, marginBottom: p.mb ?? 16, boxShadow: "0 1px 3px rgba(0,0,0,.06)" }}>
      {p.children}
    </div>
  );

  const Tab = (p: { id: string; label: string }) => (
    <button onClick={() => setTab(p.id)}
      style={{
        padding: "10px 22px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 14, fontWeight: 600,
        background: tab === p.id ? "#111" : "#f3f4f6", color: tab === p.id ? "#fff" : "#555",
        transition: "all .2s",
      }}>{p.label}</button>
  );

  const Btn = (p: { label: string; active?: boolean; onClick?: () => void; style?: any }) => (
    <button onClick={p.onClick}
      style={{ padding: "6px 14px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600,
        background: p.active ? "#111" : "#f3f4f6", color: p.active ? "#fff" : "#555", transition: "all .15s", ...(p.style || {}) }}>
      {p.label}
    </button>
  );

  const Bar = (p: { v: number; max: number; color?: string; h?: number }) => (
    <div style={{ background: "#f3f4f6", borderRadius: 6, height: p.h ?? 6, overflow: "hidden" }}>
      <div style={{ width: `${pct(p.v, p.max)}%`, height: "100%", background: p.color || "#2563eb", borderRadius: 6, transition: "width .3s" }} />
    </div>
  );

  const Th = (p: { children?: any; align?: string; w?: string }) => (
    <th style={{ textAlign: (p.align || "left") as any, padding: "10px 12px", color: "#888", fontWeight: 600, fontSize: 12, borderBottom: "2px solid #f3f4f6", width: p.w }}>
      {p.children}
    </th>
  );
  const Td = (p: { children?: any; align?: string; w?: string }) => (
    <td style={{ textAlign: (p.align || "left") as any, padding: "10px 12px", fontSize: 13, borderBottom: "1px solid #f9fafb", width: p.w }}>
      {p.children}
    </td>
  );

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", fontFamily: "-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif" }}>

      {/* ── Шапка ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Аналітика</h1>
          <p style={{ margin: "4px 0 0", color: "#888", fontSize: 13 }}>
            {data ? `${data.total.toLocaleString()} подій` : "Завантаження..."} · {data ? `сьогодні ${data.today}` : ""}
          </p>
        </div>
      </div>

      {/* ── Фільтри ── */}
      <div style={{ background: "#fff", borderRadius: 12, padding: "14px 18px", marginBottom: 16, boxShadow: "0 1px 3px rgba(0,0,0,.06)", display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
        {(["day","week","month","quarter","year","all"] as const).map(p => (
          <Btn key={p} label={p==="day"?"День":p==="week"?"Тиждень":p==="month"?"Місяць":p==="quarter"?"Квартал":p==="year"?"Рік":"Весь час"}
            active={period === p && !from && !to} onClick={() => { setPeriod(p); setFrom(""); setTo(""); }} />
        ))}
        <input type="date" value={from} onChange={e => setFrom(e.target.value)}
          style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid #d1d5db", fontSize: 13 }} />
        <input type="date" value={to} onChange={e => setTo(e.target.value)}
          style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid #d1d5db", fontSize: 13 }} />
        <Btn label="OK" onClick={load} style={{ background: "#2563eb", color: "#fff" }} />
        <select value={evt} onChange={e => setEvt(e.target.value)}
          style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid #d1d5db", fontSize: 13, background: "#fff" }}>
          <option value="">Всі події</option>
          {Object.entries(LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      {/* ── Таби ── */}
      <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
        <Tab id="overview" label="Огляд" />
        <Tab id="events" label="Події" />
        <Tab id="applications" label="Заявки" />
        <Tab id="sources" label="Джерела" />
        <Tab id="products" label="Товари та послуги" />
      </div>

      {/* ════════════════════════════════════════════════ */}
      {/* TAB: ОГЛЯД */}
      {/* ════════════════════════════════════════════════ */}
      {tab === "overview" && <>
        {/* KPI */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))", gap: 12, marginBottom: 16 }}>
          {[
            { label: "Сьогодні", val: data?.today ?? 0, color: "#16a34a" },
            { label: "Цей тиждень", val: data?.thisWeek ?? 0, color: "#2563eb" },
            { label: "Минулий тиждень", val: data?.lastWeek ?? 0, color: "#6b7280" },
            { label: "Зміна", val: `${wkChg > 0 ? "+" : ""}${wkChg}%`, color: wkChg >= 0 ? "#16a34a" : "#dc2626" },
          ].map(c => (
            <div key={c.label} style={{ background: "#fff", borderRadius: 12, padding: "20px 24px", boxShadow: "0 1px 3px rgba(0,0,0,.06)" }}>
              <p style={{ margin: "0 0 6px", fontSize: 13, color: "#888" }}>{c.label}</p>
              <p style={{ margin: 0, fontSize: 28, fontWeight: 700, color: c.color }}>{c.val}</p>
            </div>
          ))}
        </div>

        {/* По типах */}
        <C mb={16}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(165px, 1fr))", gap: 10 }}>
            {data?.byType.map(et => (
              <div key={et.event_type} style={{
                background: COLORS[et.event_type] ? `${COLORS[et.event_type]}0d` : "#f9fafb",
                padding: "18px 20px", borderRadius: 10,
                border: COLORS[et.event_type] ? `1px solid ${COLORS[et.event_type]}20` : "1px solid #e5e7eb",
              }}>
                <p style={{ margin: "0 0 6px", fontSize: 13, color: "#666" }}>{LABELS[et.event_type] || et.event_type}</p>
                <p style={{ margin: 0, fontSize: 26, fontWeight: 700, color: COLORS[et.event_type] || "#333" }}>{et.count}</p>
              </div>
            ))}
          </div>
        </C>

        {/* Графік по днях */}
        <C mb={16}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Активність по днях</h2>
            <span style={{ fontSize: 12, color: "#aaa" }}>макс: {maxDay}</span>
          </div>
          <div style={{ position: "relative", height: 200, display: "flex", alignItems: "flex-end", gap: 3, paddingBottom: 22 }}>
            {daily.map((d, i) => {
              const t = types.reduce((s, et) => s + ((d as any)[et] || 0), 0);
              const p = pct(t, maxDay);
              return (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}
                  title={`${d.day}: ${t}`}>
                  <div style={{ width: "100%", maxWidth: 32, height: `${p}%`, background: "linear-gradient(180deg,#4ade80,#16a34a)", borderRadius: "4px 4px 0 0", minHeight: t > 0 ? 4 : 0, transition: "height .3s" }} />
                  {daily.length <= 31 && <span style={{ fontSize: 8, color: "#bbb", marginTop: 4 }}>{fmt(d.day)}</span>}
                </div>
              );
            })}
            {daily.length === 0 && <p style={{ color: "#ccc", textAlign: "center", width: "100%", margin: 0 }}>Немає даних за цей період</p>}
          </div>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", borderTop: "1px solid #f3f4f6", paddingTop: 10 }}>
            {types.filter(t => LABELS[t]).map(t => (
              <span key={t} style={{ fontSize: 12, color: "#666", display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: COLORS[t] || "#999", display: "inline-block" }} />
                {LABELS[t]}
              </span>
            ))}
          </div>
        </C>

        {/* Теплова карта годин */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
          <C>
            <h2 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 600 }}>Активність по годинах</h2>
            <div style={{ display: "flex", gap: 3, alignItems: "flex-end", height: 120 }}>
              {Array.from({ length: 24 }, (_, h) => {
                const p = pct(hrs[h], maxHr);
                return (
                  <div key={h} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }} title={`${h}:00 — ${hrs[h]}`}>
                    <div style={{ width: "100%", height: `${p}%`, background: hrs[h] > 0 ? `rgba(37,99,235,${.15 + p/100 * .85})` : "#f3f4f6", borderRadius: "3px 3px 0 0", minHeight: hrs[h] > 0 ? 3 : 0 }} />
                    <span style={{ fontSize: 7, color: "#bbb", marginTop: 2 }}>{h}</span>
                  </div>
                );
              })}
            </div>
          </C>

          {/* Дні тижня */}
          <C>
            <h2 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 600 }}>Активність по днях тижня</h2>
            <div style={{ display: "flex", gap: 8, alignItems: "flex-end", height: 130 }}>
              {Array.from({ length: 7 }, (_, d) => {
                const p = pct(dows[d], maxDow);
                return (
                  <div key={d} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }} title={`${DAYS_FULL[d]}: ${dows[d]}`}>
                    <div style={{ width: "100%", maxWidth: 44, height: `${p}%`, background: "linear-gradient(180deg,#a78bfa,#7c3aed)", borderRadius: "6px 6px 0 0", minHeight: dows[d] > 0 ? 4 : 0 }} />
                    <span style={{ fontSize: 10, color: "#888", marginTop: 6, fontWeight: 600 }}>{DAYS_SHORT[d]}</span>
                    <span style={{ fontSize: 11, color: "#333", fontWeight: 600 }}>{dows[d]}</span>
                  </div>
                );
              })}
            </div>
          </C>
        </div>

        {/* Експорт */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <a href="/adminpanel/applications" style={{ padding: "10px 20px", borderRadius: 8, background: "#fff", color: "#333", textDecoration: "none", fontSize: 13, fontWeight: 500, border: "1px solid #e5e7eb" }}>Всі заявки →</a>
          <a href="/api/admin/analytics/export?type=events" target="_blank" style={{ padding: "10px 20px", borderRadius: 8, background: "#fff", color: "#333", textDecoration: "none", fontSize: 13, fontWeight: 500, border: "1px solid #e5e7eb" }}>Завантажити CSV (події)</a>
          <a href="/api/admin/analytics/export?type=applications" target="_blank" style={{ padding: "10px 20px", borderRadius: 8, background: "#fff", color: "#333", textDecoration: "none", fontSize: 13, fontWeight: 500, border: "1px solid #e5e7eb" }}>Завантажити CSV (заявки)</a>
        </div>
      </>}

      {/* ════════════════════════════════════════════════ */}
      {/* TAB: ПОДІЇ */}
      {/* ════════════════════════════════════════════════ */}
      {tab === "events" && <>
        <C>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Детальна статистика подій</h2>
            <a href="/api/admin/analytics/export?type=events" target="_blank" style={{ padding: "8px 16px", borderRadius: 6, background: "#f3f4f6", color: "#333", textDecoration: "none", fontSize: 12, fontWeight: 600 }}>CSV</a>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr><Th>Тип події</Th><Th align="right">Всього</Th><Th align="right">Частка</Th></tr>
              </thead>
              <tbody>
                {data?.byType.map(et => (
                  <tr key={et.event_type}>
                    <Td><span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: COLORS[et.event_type] || "#999" }} />
                      {LABELS[et.event_type] || et.event_type}
                    </span></Td>
                    <Td align="right"><span style={{ fontWeight: 600 }}>{et.count}</span></Td>
                    <Td align="right"><span style={{ color: "#888" }}>{pct(et.count, data?.total || 1)}%</span></Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </C>

        {data?.byProduct && data.byProduct.length > 0 && <C>
          <h3 style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 600 }}>Товари та послуги (кліки)</h3>
          <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead><tr><Th w="50%">Назва</Th><Th align="right" w="60">Кліків</Th><Th w="40%"></Th></tr></thead>
              <tbody>
                {data.byProduct.map((it, i) => (
                  <tr key={i}>
                    <Td>{it.event_data}</Td>
                    <Td align="right"><span style={{ fontWeight: 600 }}>{it.count}</span></Td>
                    <Td><Bar v={it.count} max={Math.max(...data.byProduct.map(p => p.count))} color="#d97706" /></Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </C>}

        {data?.phoneClicks && data.phoneClicks.length > 0 && <C>
          <h3 style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 600 }}>Дзвінки (натискання на телефон)</h3>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr><Th>Номер</Th><Th align="right">Натискань</Th><Th w="30%"></Th></tr></thead>
              <tbody>
                {data.phoneClicks.map((it, i) => (
                  <tr key={i}>
                    <Td>{it.event_data}</Td>
                    <Td align="right"><span style={{ fontWeight: 600 }}>{it.count}</span></Td>
                    <Td><Bar v={it.count} max={Math.max(...data.phoneClicks.map(p => p.count))} color="#2563eb" /></Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </C>}
      </>}

      {/* ════════════════════════════════════════════════ */}
      {/* TAB: ЗАЯВКИ */}
      {/* ════════════════════════════════════════════════ */}
      {tab === "applications" && <>
        <C>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Аналітика заявок</h2>
            <div style={{ display: "flex", gap: 8 }}>              
              <a href="/adminpanel/applications" style={{ padding: "8px 16px", borderRadius: 6, background: "#f3f4f6", color: "#333", textDecoration: "none", fontSize: 12, fontWeight: 600 }}>Всі заявки →</a>
              <a href="/api/admin/analytics/export?type=applications" target="_blank" style={{ padding: "8px 16px", borderRadius: 6, background: "#f3f4f6", color: "#333", textDecoration: "none", fontSize: 12, fontWeight: 600 }}>CSV</a>
            </div>
          </div>

          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Статуси</h3>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 24 }}>
            {data?.appStatuses.map(it => {
              const t = data.appStatuses.reduce((s, x) => s + x.count, 0);
              const sc: Record<string, string> = { new: "#2563eb", read: "#7c3aed", contacted: "#d97706", sent: "#16a34a", completed: "#059669", cancelled: "#dc2626" };
              const sl: Record<string, string> = { new: "Нова", read: "Прочитана", contacted: "Зв'язались", sent: "Відправлено", completed: "Завершено", cancelled: "Скасовано" };
              return (
                <div key={it.status} style={{ display: "flex", alignItems: "center", gap: 8, background: "#f9fafb", padding: "8px 16px", borderRadius: 8 }}>
                  <span style={{ width: 10, height: 10, borderRadius: "50%", background: sc[it.status] || "#999" }} />
                  <span style={{ fontSize: 13 }}>{sl[it.status] || it.status}:</span>
                  <strong style={{ fontSize: 14 }}>{it.count} ({pct(it.count, t)}%)</strong>
                </div>
              );
            })}
          </div>

          {data?.appProducts && data.appProducts.length > 0 && <>
            <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Заявки по товарах</h3>
            <div style={{ overflowX: "auto", marginBottom: 24 }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead><tr><Th w="60%">Товар</Th><Th align="right" w="60">Заявок</Th><Th w="30%"></Th></tr></thead>
                <tbody>
                  {data.appProducts.map((it, i) => (
                    <tr key={i}>
                      <Td>{it.product}</Td>
                      <Td align="right"><span style={{ fontWeight: 600 }}>{it.count}</span></Td>
                      <Td><Bar v={it.count} max={Math.max(...data.appProducts.map(p => p.count))} color="#0891b2" /></Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>}

          {data?.appsByDay && data.appsByDay.length > 0 && <>
            <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Динаміка заявок по днях</h3>
            <div style={{ height: 180, display: "flex", alignItems: "flex-end", gap: 4, paddingBottom: 24 }}>
              {data.appsByDay.map((it, i) => {
                const mx = Math.max(...data.appsByDay.map(a => a.count));
                const p = pct(it.count, mx);
                return (
                  <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }} title={`${it.day}: ${it.count}`}>
                    <div style={{
                      width: "100%", maxWidth: 36, height: `${p}%`,
                      background: "linear-gradient(180deg, #22d3ee, #0891b2)",
                      borderRadius: "4px 4px 0 0", minHeight: it.count > 0 ? 4 : 0,
                    }} />
                    <span style={{ fontSize: 9, color: "#999", marginTop: 4, whiteSpace: "nowrap" }}>
                      {it.day?.slice(5)}
                    </span>
                  </div>
                );
              })}
            </div>
          </>}
        </C>
      </>}

      {/* ════════════════════════════════════════════════ */}
      {/* TAB: ДЖЕРЕЛА */}
      {/* ════════════════════════════════════════════════ */}
      {tab === "sources" && <>
        <C>
          <h2 style={{ margin: "0 0 20px", fontSize: 16, fontWeight: 600 }}>Звідки приходять відвідувачі</h2>

          {data?.utmStats && data.utmStats.length > 0 ? <>
            <div style={{ overflowX: "auto", marginBottom: 20 }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead><tr><Th>Джерело</Th><Th>Тип</Th><Th>Кампанія</Th><Th align="right">Переходів</Th><Th w="30%"></Th></tr></thead>
                <tbody>
                  {data.utmStats.map((it, i) => {
                    const mx = Math.max(...data.utmStats.map(u => u.count));
                    const ls: Record<string, string> = { direct: "Прямий", google: "Google", facebook: "Facebook", instagram: "Instagram", olx: "OLX" };
                    return (
                      <tr key={i}>
                        <Td><span style={{ fontWeight: 500 }}>{ls[it.source] || it.source}</span></Td>
                        <Td><span style={{ color: "#888" }}>{it.medium}</span></Td>
                        <Td><span style={{ color: "#888" }}>{it.campaign}</span></Td>
                        <Td align="right"><span style={{ fontWeight: 600 }}>{it.count}</span></Td>
                        <Td><Bar v={it.count} max={mx} color="#7c3aed" /></Td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: 160 }}>
              {data.utmStats.slice(0, 10).map((it, i) => {
                const mx = Math.max(...data.utmStats.map(u => u.count));
                const p = pct(it.count, mx);
                const pal = ["#7c3aed","#2563eb","#16a34a","#d97706","#dc2626","#0891b2","#ec4899","#4f46e5","#ea580c","#65a30d"];
                return (
                  <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div style={{ width: "100%", maxWidth: 48, height: `${p}%`, background: pal[i % pal.length], borderRadius: "6px 6px 0 0", minHeight: it.count > 0 ? 4 : 0 }} />
                    <span style={{ fontSize: 9, color: "#888", marginTop: 4, textAlign: "center", lineHeight: 1.2 }}>{it.source}<br/>{it.count}</span>
                  </div>
                );
              })}
            </div>
          </> : <p style={{ color: "#999", textAlign: "center", padding: 40, fontSize: 14 }}>
            Дані про джерела з'являться, коли відвідувачі будуть переходити на сайт з UTM-мітками (реклама, соцмережі тощо).
          </p>}

          {data?.topReferrers && data.topReferrers.length > 0 && <div style={{ marginTop: 24 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Зовнішні посилання (Referrers)</h3>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr><Th>Джерело</Th><Th align="right">Переходів</Th><Th w="30%"></Th></tr></thead>
              <tbody>
                {data.topReferrers.map((it, i) => (
                  <tr key={i}>
                    <Td>{it.referrer === "(direct)" ? "Прямий перехід" : it.referrer}</Td>
                    <Td align="right"><span style={{ fontWeight: 600 }}>{it.count}</span></Td>
                    <Td><Bar v={it.count} max={Math.max(...data.topReferrers.map(r => r.count))} color="#4f46e5" /></Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>}
        </C>
      </>}

      {/* ════════════════════════════════════════════════ */}
      {/* TAB: ТОВАРИ ТА ПОСЛУГИ */}
      {/* ════════════════════════════════════════════════ */}
      {tab === "products" && <>
        <C>
          <h2 style={{ margin: "0 0 20px", fontSize: 16, fontWeight: 600 }}>Які товари цікавлять клієнтів</h2>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 }}>
            <div>
              <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Кліки по товарах</h3>
              {data?.byProduct && data.byProduct.length > 0 ? (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead><tr><Th>Товар / Послуга</Th><Th align="right">Кліків</Th></tr></thead>
                    <tbody>
                      {data.byProduct.map((it, i) => (
                        <tr key={i}><Td>{it.event_data}</Td><Td align="right"><span style={{ fontWeight: 600 }}>{it.count}</span></Td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : <p style={{ color: "#ccc", fontSize: 13 }}>Немає даних</p>}
            </div>

            <div>
              <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Фактичні заявки</h3>
              {data?.appProducts && data.appProducts.length > 0 ? (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead><tr><Th>Товар</Th><Th align="right">Заявок</Th></tr></thead>
                    <tbody>
                      {data.appProducts.map((it, i) => (
                        <tr key={i}><Td>{it.product}</Td><Td align="right"><span style={{ fontWeight: 600 }}>{it.count}</span></Td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : <p style={{ color: "#ccc", fontSize: 13 }}>Немає даних</p>}
            </div>
          </div>

          {data?.phoneClicks && data.phoneClicks.length > 0 && <div>
            <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Натискання на телефони</h3>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead><tr><Th>Номер</Th><Th align="right">Натискань</Th><Th w="30%"></Th></tr></thead>
                <tbody>
                  {data.phoneClicks.map((it, i) => (
                    <tr key={i}>
                      <Td><span style={{ fontWeight: 500 }}>{it.event_data || "Номер"}</span></Td>
                      <Td align="right"><span style={{ fontWeight: 600 }}>{it.count}</span></Td>
                      <Td><Bar v={it.count} max={Math.max(...data.phoneClicks.map(p => p.count))} color="#2563eb" /></Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>}

          {!data?.phoneClicks?.length && !data?.byProduct?.length && !data?.appProducts?.length &&
            <p style={{ color: "#999", textAlign: "center", padding: 40 }}>Немає даних. Коли відвідувачі почнуть взаємодіяти з сайтом, статистика з'явиться тут.</p>
          }
        </C>
      </>}

    </div>
  );
}
