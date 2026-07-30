"use client";
import { useEffect, useState, useCallback } from "react";

type AnalyticsData = {
  total: number;
  today: number;
  thisWeek: number;
  lastWeek: number;
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

const EVENT_LABELS: Record<string, string> = {
  click_phone: "📞 Дзвінки",
  click_viber: "💬 Viber",
  click_whatsapp: "💬 WhatsApp",
  click_product: "🛒 Кліки товарів",
  click_service: "🔧 Кліки послуг",
  submit_application: "📝 Заявки",
  page_view: "👁️ Перегляди",
};

const EVENT_COLORS: Record<string, string> = {
  click_phone: "#3b82f6",
  click_viber: "#8b5cf6",
  click_whatsapp: "#22c55e",
  click_product: "#f59e0b",
  click_service: "#ef4444",
  submit_application: "#06b6d4",
  page_view: "#6366f1",
};

const DAY_NAMES = ["Нд", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("uk-UA", { day: "numeric", month: "short" });
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("month");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [eventFilter, setEventFilter] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : "";

  const load = useCallback(async () => {
    setLoading(true);
    try {
      let url = `/api/admin/analytics?period=${period}`;
      if (dateFrom) url += `&from=${dateFrom}`;
      if (dateTo) url += `&to=${dateTo}`;
      if (eventFilter) url += `&event=${eventFilter}`;
      const r = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      const json = await r.json();
      setData(json);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [period, dateFrom, dateTo, eventFilter, token]);

  useEffect(() => { load(); }, [load]);

  if (loading && !data) return (
    <div style={{ display: "flex", justifyContent: "center", padding: 80 }}>
      <div style={{ width: 40, height: 40, border: "4px solid #e5e7eb", borderTopColor: "#22c55e", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );

  if (!data) return <p style={{ padding: 40, color: "#666" }}>Помилка завантаження даних</p>;

  // Aggregate byDay into chart data
  const aggregateByDay = () => {
    if (!data.byDay?.length) return [];
    const dayMap: Record<string, Record<string, number>> = {};
    for (const entry of data.byDay) {
      if (!dayMap[entry.day]) dayMap[entry.day] = {};
      dayMap[entry.day][entry.event_type] = (dayMap[entry.day][entry.event_type] || 0) + entry.count;
    }
    return Object.entries(dayMap)
      .map(([day, events]) => ({ day, ...events }))
      .sort((a, b) => a.day.localeCompare(b.day));
  };

  const dailyData = aggregateByDay();
  const eventTypes = [...new Set(data.byDay?.map(e => e.event_type) || [])];
  const maxDailyValue = Math.max(1, ...dailyData.map(d => eventTypes.reduce((sum, et) => sum + ((d as any)[et] || 0), 0)));

  // Hour heatmap data
  const hourData: Record<number, Record<string, number>> = {};
  for (let h = 0; h < 24; h++) hourData[h] = {};
  if (data.byHourOfDay) {
    for (const entry of data.byHourOfDay) {
      if (!hourData[entry.hour]) hourData[entry.hour] = {};
      hourData[entry.hour][entry.event_type] = (hourData[entry.hour][entry.event_type] || 0) + entry.count;
    }
  }
  const maxHourValue = Math.max(1, ...Object.values(hourData).map(h => Object.values(h).reduce((a: number, b: number) => a + b, 0)));

  // Day of week data
  const dowData: Record<number, Record<string, number>> = {};
  for (let d = 0; d < 7; d++) dowData[d] = {};
  if (data.byDayOfWeek) {
    for (const entry of data.byDayOfWeek) {
      if (!dowData[entry.dow]) dowData[entry.dow] = {};
      dowData[entry.dow][entry.event_type] = (dowData[entry.dow][entry.event_type] || 0) + entry.count;
    }
  }
  const maxDowValue = Math.max(1, ...Object.values(dowData).map(d => Object.values(d).reduce((a: number, b: number) => a + b, 0)));

  const weekChange = data.lastWeek > 0 ? Math.round(((data.thisWeek - data.lastWeek) / data.lastWeek) * 100) : data.thisWeek > 0 ? 100 : 0;

  const tabs = [
    { id: "overview", label: "📊 Огляд" },
    { id: "events", label: "📋 Події" },
    { id: "applications", label: "📝 Заявки" },
    { id: "utm", label: "🌐 Джерела" },
    { id: "products", label: "🛒 Товари" },
  ];

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto" }}>
      {/* ===== HEADER ===== */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>📊 Аналітика</h1>
          <p style={{ margin: "4px 0 0", color: "#888", fontSize: 13 }}>
            {data.total > 0 ? `Всього подій: ${data.total.toLocaleString()}` : "Даних поки що немає. Відвідайте сайт, щоб зібрати статистику."}
          </p>
        </div>
      </div>

      {/* ===== PERIOD PICKER + FILTERS ===== */}
      <div style={{ background: "#fff", borderRadius: 16, padding: "16px 20px", marginBottom: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {(["day", "week", "month", "quarter", "year", "all"] as const).map(p => (
            <button key={p} onClick={() => { setPeriod(p); setDateFrom(""); setDateTo(""); }}
              style={{
                padding: "7px 14px", borderRadius: 8, border: "none", cursor: "pointer",
                fontWeight: 600, fontSize: 12, transition: "all 0.2s",
                background: period === p ? "#22c55e" : "#f3f4f6",
                color: period === p ? "#fff" : "#555",
              }}>
              {p === "day" ? "День" : p === "week" ? "Тиждень" : p === "month" ? "Місяць" : p === "quarter" ? "Квартал" : p === "year" ? "Рік" : "Весь час"}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", marginLeft: "auto" }}>
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
            style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 12 }} />
          <span style={{ color: "#999" }}>—</span>
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
            style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 12 }} />
          <button onClick={load} style={{
            padding: "7px 14px", borderRadius: 8, border: "none", cursor: "pointer",
            background: "#3b82f6", color: "#fff", fontWeight: 600, fontSize: 12,
          }}>Застосувати</button>
        </div>
        <select value={eventFilter} onChange={e => setEventFilter(e.target.value)}
          style={{ padding: "7px 10px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 12, background: "#fff" }}>
          <option value="">Всі події</option>
          {Object.entries(EVENT_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>

      {/* ===== TABS ===== */}
      <div style={{ display: "flex", gap: 4, marginBottom: 20, flexWrap: "wrap" }}>
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            style={{
              padding: "10px 20px", borderRadius: 10, border: "none", cursor: "pointer",
              fontWeight: 600, fontSize: 14, transition: "all 0.2s",
              background: activeTab === tab.id ? "#fff" : "transparent",
              color: activeTab === tab.id ? "#333" : "#888",
              boxShadow: activeTab === tab.id ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
            }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ============================================== */}
      {/* TAB: OVERVIEW */}
      {/* ============================================== */}
      {activeTab === "overview" && (
        <>
          {/* KPI Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 12, marginBottom: 24 }}>
            <div style={{ background: "#fff", borderRadius: 12, padding: "16px 20", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <p style={{ margin: "0 0 4px", fontSize: 12, color: "#888" }}>Сьогодні</p>
              <p style={{ margin: 0, fontSize: 28, fontWeight: 700, color: "#22c55e" }}>{data.today}</p>
            </div>
            <div style={{ background: "#fff", borderRadius: 12, padding: "16px 20", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <p style={{ margin: "0 0 4px", fontSize: 12, color: "#888" }}>Цей тиждень</p>
              <p style={{ margin: 0, fontSize: 28, fontWeight: 700, color: "#3b82f6" }}>{data.thisWeek}</p>
            </div>
            <div style={{ background: "#fff", borderRadius: 12, padding: "16px 20", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <p style={{ margin: "0 0 4px", fontSize: 12, color: "#888" }}>Минулий тиждень</p>
              <p style={{ margin: 0, fontSize: 28, fontWeight: 700, color: "#888" }}>{data.lastWeek}</p>
            </div>
            <div style={{ background: "#fff", borderRadius: 12, padding: "16px 20", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <p style={{ margin: "0 0 4px", fontSize: 12, color: "#888" }}>Зміна</p>
              <p style={{ margin: 0, fontSize: 28, fontWeight: 700, color: weekChange >= 0 ? "#22c55e" : "#ef4444" }}>
                {weekChange > 0 ? "+" : ""}{weekChange}%
              </p>
            </div>
          </div>

          {/* By Type Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12, marginBottom: 24 }}>
            {data.byType.map(et => (
              <div key={et.event_type} style={{
                background: EVENT_COLORS[et.event_type] ? `${EVENT_COLORS[et.event_type]}12` : "#f9fafb",
                padding: "16px 20px", borderRadius: 12,
                border: EVENT_COLORS[et.event_type] ? `1px solid ${EVENT_COLORS[et.event_type]}25` : "1px solid #e5e7eb",
              }}>
                <p style={{ margin: "0 0 4px", fontSize: 12, color: "#666" }}>
                  {EVENT_LABELS[et.event_type] || et.event_type}
                </p>
                <p style={{ margin: 0, fontSize: 26, fontWeight: 700, color: EVENT_COLORS[et.event_type] || "#333" }}>
                  {et.count}
                </p>
              </div>
            ))}
          </div>

          {/* Chart - Events by Day */}
          <div style={{ background: "#fff", borderRadius: 16, padding: 24, marginBottom: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>Активність по днях</h2>
              <span style={{ fontSize: 12, color: "#999" }}>max: {maxDailyValue}</span>
            </div>
            <div style={{ position: "relative", height: 200, display: "flex", alignItems: "flex-end", gap: 2, paddingBottom: 20 }}>
              {dailyData.length === 0 && (
                <p style={{ color: "#ccc", textAlign: "center", width: "100%", margin: 0 }}>Немає даних за цей період</p>
              )}
              {dailyData.map((d, i) => {
                const dayTotal = eventTypes.reduce((sum, et) => sum + ((d as any)[et] || 0), 0);
                const pct = maxDailyValue > 0 ? (dayTotal / maxDailyValue) * 100 : 0;
                return (
                  <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}
                    title={`${d.day}: ${dayTotal} подій`}>
                    <div style={{
                      width: "100%", maxWidth: 36, height: `${pct}%`,
                      background: "linear-gradient(180deg, #4ade80, #16a34a)",
                      borderRadius: "4px 4px 0 0", minHeight: dayTotal > 0 ? 4 : 0,
                      transition: "height 0.3s",
                    }} />
                    {dailyData.length <= 31 && (
                      <span style={{ fontSize: 8, color: "#bbb", marginTop: 4, transform: i % 2 === 0 ? "none" : "translateY(4px)" }}>
                        {formatDate(d.day)}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
            {eventTypes.length > 1 && (
              <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 8, borderTop: "1px solid #f3f4f6", paddingTop: 12 }}>
                {eventTypes.filter(et => EVENT_LABELS[et]).map(et => (
                  <span key={et} style={{ fontSize: 11, color: "#666", display: "flex", alignItems: "center", gap: 4 }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: EVENT_COLORS[et] || "#999", display: "inline-block" }} />
                    {EVENT_LABELS[et] || et}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Heatmap: Hour of Day */}
          <div style={{ background: "#fff", borderRadius: 16, padding: 24, marginBottom: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <h2 style={{ margin: "0 0 16px", fontSize: 18, fontWeight: 600 }}>🕐 Активність по годинах</h2>
            <div style={{ display: "flex", gap: 3, alignItems: "flex-end", height: 140, padding: "0 0 24px" }}>
              {Array.from({ length: 24 }, (_, h) => {
                const total = Object.values(hourData[h]).reduce((a: number, b: number) => a + b, 0);
                const pct = maxHourValue > 0 ? (total / maxHourValue) * 100 : 0;
                return (
                  <div key={h} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}
                    title={`${h}:00 - ${total} подій`}>
                    <div style={{
                      width: "100%", height: `${pct}%`,
                      background: total > 0 ? `rgba(59, 130, 246, ${0.2 + (pct / 100) * 0.8})` : "#f3f4f6",
                      borderRadius: "3px 3px 0 0", minHeight: total > 0 ? 3 : 0,
                    }} />
                    <span style={{ fontSize: 7, color: "#bbb", marginTop: 2 }}>{h}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Day of Week */}
          <div style={{ background: "#fff", borderRadius: 16, padding: 24, marginBottom: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <h2 style={{ margin: "0 0 16px", fontSize: 18, fontWeight: 600 }}>📅 Активність по днях тижня</h2>
            <div style={{ display: "flex", gap: 8, alignItems: "flex-end", height: 160, padding: "0 0 24px" }}>
              {Array.from({ length: 7 }, (_, d) => {
                const total = Object.values(dowData[d]).reduce((a: number, b: number) => a + b, 0);
                const pct = maxDowValue > 0 ? (total / maxDowValue) * 100 : 0;
                return (
                  <div key={d} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}
                    title={`${DAY_NAMES[d]}: ${total} подій`}>
                    <div style={{
                      width: "100%", maxWidth: 50, height: `${pct}%`,
                      background: "linear-gradient(180deg, #a78bfa, #7c3aed)",
                      borderRadius: "6px 6px 0 0", minHeight: total > 0 ? 4 : 0,
                    }} />
                    <span style={{ fontSize: 10, color: "#888", marginTop: 6, fontWeight: 600 }}>{DAY_NAMES[d]}</span>
                    <span style={{ fontSize: 11, color: "#555", fontWeight: 600 }}>{total}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick links */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 8 }}>
            <a href="/adminpanel/applications" style={{ padding: "10px 20px", borderRadius: 10, background: "#fff", color: "#333", textDecoration: "none", fontSize: 13, fontWeight: 500, border: "1px solid #e5e7eb" }}>
              📝 Всі заявки →
            </a>
            <a href="/api/admin/analytics/export?type=events&period=month" target="_blank" style={{ padding: "10px 20px", borderRadius: 10, background: "#fff", color: "#333", textDecoration: "none", fontSize: 13, fontWeight: 500, border: "1px solid #e5e7eb" }}>
              ⬇ Експорт CSV (події)
            </a>
            <a href="/api/admin/analytics/export?type=applications&period=month" target="_blank" style={{ padding: "10px 20px", borderRadius: 10, background: "#fff", color: "#333", textDecoration: "none", fontSize: 13, fontWeight: 500, border: "1px solid #e5e7eb" }}>
              ⬇ Експорт CSV (заявки)
            </a>
          </div>
        </>
      )}

      {/* ============================================== */}
      {/* TAB: EVENTS */}
      {/* ============================================== */}
      {activeTab === "events" && (
        <div style={{ background: "#fff", borderRadius: 16, padding: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>📋 Детальна статистика подій</h2>
            <a href="/api/admin/analytics/export?type=events" target="_blank"
              style={{ padding: "8px 16px", borderRadius: 8, background: "#f3f4f6", color: "#333", textDecoration: "none", fontSize: 12, fontWeight: 600 }}>
              ⬇ CSV
            </a>
          </div>

          {/* Summary table by type */}
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #f3f4f6" }}>
                  <th style={{ textAlign: "left", padding: "10px 12px", color: "#888", fontWeight: 600, fontSize: 12 }}>Тип події</th>
                  <th style={{ textAlign: "right", padding: "10px 12px", color: "#888", fontWeight: 600, fontSize: 12 }}>Всього</th>
                  <th style={{ textAlign: "right", padding: "10px 12px", color: "#888", fontWeight: 600, fontSize: 12 }}>%</th>
                  <th style={{ textAlign: "right", padding: "10px 12px", color: "#888", fontWeight: 600, fontSize: 12 }}>Сьогодні</th>
                </tr>
              </thead>
              <tbody>
                {data.byType.map(et => {
                  const pct = data.total > 0 ? Math.round((et.count / data.total) * 100) : 0;
                  return (
                    <tr key={et.event_type} style={{ borderBottom: "1px solid #f9fafb" }}>
                      <td style={{ padding: "10px 12px" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ width: 8, height: 8, borderRadius: "50%", background: EVENT_COLORS[et.event_type] || "#999" }} />
                          {EVENT_LABELS[et.event_type] || et.event_type}
                        </span>
                      </td>
                      <td style={{ padding: "10px 12px", textAlign: "right", fontWeight: 600 }}>{et.count}</td>
                      <td style={{ padding: "10px 12px", textAlign: "right", color: "#888" }}>{pct}%</td>
                      <td style={{ padding: "10px 12px", textAlign: "right" }}>-</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Products & Services table */}
          {data.byProduct.length > 0 && (
            <div style={{ marginTop: 24 }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>🛒 Кліки по товарах та послугах</h3>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid #f3f4f6" }}>
                      <th style={{ textAlign: "left", padding: "8px 12px", color: "#888", fontWeight: 600, fontSize: 11 }}>Назва</th>
                      <th style={{ textAlign: "right", padding: "8px 12px", color: "#888", fontWeight: 600, fontSize: 11 }}>Кліків</th>
                      <th style={{ padding: "8px 12px", color: "#888", fontWeight: 600, fontSize: 11 }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.byProduct.slice(0, 15).map((item, i) => {
                      const max = Math.max(...data.byProduct.map(p => p.count));
                      return (
                        <tr key={i} style={{ borderBottom: "1px solid #f9fafb" }}>
                          <td style={{ padding: "8px 12px" }}>{item.event_data}</td>
                          <td style={{ padding: "8px 12px", textAlign: "right", fontWeight: 600 }}>{item.count}</td>
                          <td style={{ padding: "8px 12px", width: "40%" }as any}>
                            <div style={{ background: "#f3f4f6", borderRadius: 6, height: 6, overflow: "hidden" }}>
                              <div style={{ width: `${(item.count / max) * 100}%`, height: "100%", background: "#f59e0b", borderRadius: 6 }} />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================== */}
      {/* TAB: APPLICATIONS */}
      {/* ============================================== */}
      {activeTab === "applications" && (
        <div style={{ background: "#fff", borderRadius: 16, padding: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>📝 Аналітика заявок</h2>
            <div style={{ display: "flex", gap: 8 }}>
              <a href="/adminpanel/applications" style={{ padding: "8px 16px", borderRadius: 8, background: "#f3f4f6", color: "#333", textDecoration: "none", fontSize: 12, fontWeight: 600 }}>
                Всі заявки →
              </a>
              <a href="/api/admin/analytics/export?type=applications" target="_blank"
                style={{ padding: "8px 16px", borderRadius: 8, background: "#f3f4f6", color: "#333", textDecoration: "none", fontSize: 12, fontWeight: 600 }}>
                ⬇ CSV
              </a>
            </div>
          </div>

          {/* Statuses */}
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>📊 Статуси</h3>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              {data.appStatuses.map(item => {
                const total = data.appStatuses.reduce((sum, s) => sum + s.count, 0);
                const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;
                const sc: Record<string, string> = { new: "#3b82f6", read: "#8b5cf6", contacted: "#f59e0b", sent: "#22c55e", completed: "#16a34a", cancelled: "#ef4444" };
                const sl: Record<string, string> = { new: "Нова", read: "Прочитана", contacted: "Зв'язались", sent: "Відправлено", completed: "Завершено", cancelled: "Скасовано" };
                return (
                  <div key={item.status} style={{ display: "flex", alignItems: "center", gap: 8, background: "#f9fafb", padding: "8px 16px", borderRadius: 10 }}>
                    <span style={{ width: 10, height: 10, borderRadius: "50%", background: sc[item.status] || "#999" }} />
                    <span style={{ fontSize: 13 }}>{sl[item.status] || item.status}:</span>
                    <strong style={{ fontSize: 14 }}>{item.count} ({pct}%)</strong>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Products in applications */}
          {data.appProducts.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>📦 Заявки по товарах</h3>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid #f3f4f6" }}>
                      <th style={{ textAlign: "left", padding: "8px 12px", color: "#888", fontWeight: 600, fontSize: 11 }}>Товар</th>
                      <th style={{ textAlign: "right", padding: "8px 12px", color: "#888", fontWeight: 600, fontSize: 11 }}>Заявок</th>
                      <th style={{ padding: "8px 12px", color: "#888", fontWeight: 600, fontSize: 11 }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.appProducts.map((item, i) => {
                      const max = Math.max(...data.appProducts.map(p => p.count));
                      return (
                        <tr key={i} style={{ borderBottom: "1px solid #f9fafb" }}>
                          <td style={{ padding: "8px 12px" }}>{item.product}</td>
                          <td style={{ padding: "8px 12px", textAlign: "right", fontWeight: 600 }}>{item.count}</td>
                          <td style={{ padding: "8px 12px" } as any}>
                            <div style={{ background: "#f3f4f6", borderRadius: 6, height: 6, overflow: "hidden" }}>
                              <div style={{ width: `${(item.count / max) * 100}%`, height: "100%", background: "#06b6d4", borderRadius: 6 }} />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Applications by Day */}
          {data.appsByDay.length > 0 && (
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>📈 Динаміка заявок</h3>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 120, paddingBottom: 20 }}>
                {data.appsByDay.map((item, i) => {
                  const max = Math.max(...data.appsByDay.map(a => a.count));
                  const pct = max > 0 ? (item.count / max) * 100 : 0;
                  return (
                    <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}
                      title={`${item.day}: ${item.count} заявок`}>
                      <div style={{
                        width: "100%", maxWidth: 24, height: `${pct}%`,
                        background: "linear-gradient(180deg, #22d3ee, #0891b2)",
                        borderRadius: "3px 3px 0 0", minHeight: item.count > 0 ? 3 : 0,
                      }} />
                      <span style={{ fontSize: 7, color: "#bbb", marginTop: 2 }}>{item.day?.slice(5)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================== */}
      {/* TAB: UTM / SOURCES */}
      {/* ============================================== */}
      {activeTab === "utm" && (
        <div style={{ background: "#fff", borderRadius: 16, padding: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <h2 style={{ margin: "0 0 20px", fontSize: 18, fontWeight: 600 }}>🌐 Звідки приходять відвідувачі</h2>

          {data.utmStats.length === 0 ? (
            <p style={{ color: "#999", textAlign: "center", padding: 40 }}>
              Немає даних про джерела. Дані з'являться, коли відвідувачі будуть переходити на сайт з UTM-мітками (реклама, соцмережі).
            </p>
          ) : (
            <>
              <div style={{ overflowX: "auto", marginBottom: 24 }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid #f3f4f6" }}>
                      <th style={{ textAlign: "left", padding: "10px 12px", color: "#888", fontWeight: 600, fontSize: 11 }}>Джерело</th>
                      <th style={{ textAlign: "left", padding: "10px 12px", color: "#888", fontWeight: 600, fontSize: 11 }}>Тип</th>
                      <th style={{ textAlign: "left", padding: "10px 12px", color: "#888", fontWeight: 600, fontSize: 11 }}>Кампанія</th>
                      <th style={{ textAlign: "right", padding: "10px 12px", color: "#888", fontWeight: 600, fontSize: 11 }}>Переходів</th>
                      <th style={{ padding: "10px 12px", color: "#888", fontWeight: 600, fontSize: 11 }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.utmStats.map((item, i) => {
                      const max = Math.max(...data.utmStats.map(u => u.count));
                      const sourceLabels: Record<string, string> = {
                        direct: "🔄 Прямий", google: "🔍 Google", facebook: "📘 Facebook",
                        instagram: "📷 Instagram", olx: "🛒 OLX",
                      };
                      return (
                        <tr key={i} style={{ borderBottom: "1px solid #f9fafb" }}>
                          <td style={{ padding: "10px 12px" }}>
                            <span style={{ fontWeight: 500 }}>{sourceLabels[item.source] || item.source}</span>
                          </td>
                          <td style={{ padding: "10px 12px", color: "#888" }}>{item.medium}</td>
                          <td style={{ padding: "10px 12px", color: "#888" }}>{item.campaign}</td>
                          <td style={{ padding: "10px 12px", textAlign: "right", fontWeight: 600 }}>{item.count}</td>
                          <td style={{ padding: "10px 12px" } as any}>
                            <div style={{ background: "#f3f4f6", borderRadius: 6, height: 6, overflow: "hidden" }}>
                              <div style={{ width: `${(item.count / max) * 100}%`, height: "100%", background: "#8b5cf6", borderRadius: 6 }} />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Chart */}
              <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: 160, paddingBottom: 20 }}>
                {data.utmStats.slice(0, 8).map((item, i) => {
                  const max = Math.max(...data.utmStats.map(u => u.count));
                  const pct = max > 0 ? (item.count / max) * 100 : 0;
                  const colors = ["#8b5cf6", "#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#06b6d4", "#ec4899", "#6366f1"];
                  return (
                    <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <div style={{
                        width: "100%", maxWidth: 50, height: `${pct}%`,
                        background: colors[i % colors.length],
                        borderRadius: "6px 6px 0 0", minHeight: item.count > 0 ? 4 : 0,
                      }} />
                      <span style={{ fontSize: 9, color: "#888", marginTop: 6, textAlign: "center", lineHeight: 1.2 }}>
                        {item.source}<br/>{item.count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* Referrers */}
          {data.topReferrers?.length > 0 && (
            <div style={{ marginTop: 24 }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>🔗 Звідки переходять (Referrers)</h3>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid #f3f4f6" }}>
                    <th style={{ textAlign: "left", padding: "8px 12px", color: "#888", fontWeight: 600, fontSize: 11 }}>Джерело</th>
                    <th style={{ textAlign: "right", padding: "8px 12px", color: "#888", fontWeight: 600, fontSize: 11 }}>Переходів</th>
                    <th style={{ padding: "8px 12px" }}></th>
                  </tr>
                </thead>
                <tbody>
                  {data.topReferrers.map((item, i) => {
                    const max = Math.max(...data.topReferrers.map(r => r.count));
                    return (
                      <tr key={i} style={{ borderBottom: "1px solid #f9fafb" }}>
                        <td style={{ padding: "8px 12px", maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {item.referrer === "(direct)" ? "🔄 Прямий перехід" : item.referrer}
                        </td>
                        <td style={{ padding: "8px 12px", textAlign: "right", fontWeight: 600 }}>{item.count}</td>
                        <td style={{ padding: "8px 12px" } as any}>
                          <div style={{ background: "#f3f4f6", borderRadius: 6, height: 6, overflow: "hidden" }}>
                            <div style={{ width: `${(item.count / max) * 100}%`, height: "100%", background: "#6366f1", borderRadius: 6 }} />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ============================================== */}
      {/* TAB: PRODUCTS */}
      {/* ============================================== */}
      {activeTab === "products" && (
        <div style={{ background: "#fff", borderRadius: 16, padding: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <h2 style={{ margin: "0 0 20px", fontSize: 18, fontWeight: 600 }}>🛒 Які товари цікавлять клієнтів</h2>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 }}>
            {/* Product clicks */}
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Кліки "Уточнити ціну"</h3>
              {data.byProduct.length === 0 ? (
                <p style={{ color: "#ccc" }}>Немає даних</p>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid #f3f4f6" }}>
                      <th style={{ textAlign: "left", padding: "8px 12px", color: "#888", fontWeight: 600, fontSize: 11 }}>Товар/Послуга</th>
                      <th style={{ textAlign: "right", padding: "8px 12px", color: "#888", fontWeight: 600, fontSize: 11 }}>Кліків</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.byProduct.map((item, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid #f9fafb" }}>
                        <td style={{ padding: "8px 12px" }}>{item.event_data}</td>
                        <td style={{ padding: "8px 12px", textAlign: "right", fontWeight: 600 }}>{item.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Application products */}
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Фактичні заявки по товарах</h3>
              {data.appProducts.length === 0 ? (
                <p style={{ color: "#ccc" }}>Немає даних</p>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid #f3f4f6" }}>
                      <th style={{ textAlign: "left", padding: "8px 12px", color: "#888", fontWeight: 600, fontSize: 11 }}>Товар</th>
                      <th style={{ textAlign: "right", padding: "8px 12px", color: "#888", fontWeight: 600, fontSize: 11 }}>Заявок</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.appProducts.map((item, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid #f9fafb" }}>
                        <td style={{ padding: "8px 12px" }}>{item.product}</td>
                        <td style={{ padding: "8px 12px", textAlign: "right", fontWeight: 600 }}>{item.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Phone clicks */}
          {data.phoneClicks.length > 0 && (
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>📞 Натискання на телефони</h3>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid #f3f4f6" }}>
                    <th style={{ textAlign: "left", padding: "8px 12px", color: "#888", fontWeight: 600, fontSize: 11 }}>Номер</th>
                    <th style={{ textAlign: "right", padding: "8px 12px", color: "#888", fontWeight: 600, fontSize: 11 }}>Натискань</th>
                  </tr>
                </thead>
                <tbody>
                  {data.phoneClicks.map((item, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid #f9fafb" }}>
                      <td style={{ padding: "8px 12px" }}>{item.event_data || "Номер"}</td>
                      <td style={{ padding: "8px 12px", textAlign: "right", fontWeight: 600 }}>{item.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
