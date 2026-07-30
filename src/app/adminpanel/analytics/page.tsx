"use client";
import { useEffect, useState } from "react";

type AnalyticsData = {
  total: number;
  today: number;
  byType: { event_type: string; count: number }[];
  byDay: { day: string; event_type: string; count: number }[];
  byHour: { hour: string; event_type: string; count: number }[];
  byProduct: { event_data: string; count: number }[];
  appProducts: { product: string; count: number }[];
  appStatuses: { status: string; count: number }[];
  appsByDay: { day: string; count: number }[];
  phoneClicks: { event_data: string; count: number }[];
  utmStats: { source: string; count: number }[];
};

const EVENT_LABELS: Record<string, string> = {
  click_phone: "📞 Дзвінки",
  click_viber: "💬 Viber",
  click_whatsapp: "💬 WhatsApp",
  click_product: "🛒 Кліки по товарах",
  click_service: "🔧 Кліки по послугах",
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

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("all");
  const [selectedChart, setSelectedChart] = useState<string | null>(null);
  const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : "";

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetch(`/api/admin/analytics?period=${period}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await r.json();
      setData(json);
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [period]);

  // Aggregate byDay into a chart-friendly format
  const aggregateByDay = () => {
    if (!data?.byDay) return [];
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
  const eventTypes = [...new Set(data?.byDay?.map(e => e.event_type) || [])];

  // Get max value for chart scaling
  const maxDailyValue = Math.max(
    1,
    ...dailyData.map(d => 
      eventTypes.reduce((sum, et) => sum + ((d as any)[et] || 0), 0)
    )
  );

  if (loading) return <p>Завантаження...</p>;
  if (!data) return <p>Помилка завантаження даних</p>;

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>📊 Аналітика</h1>
          <p style={{ margin: "4px 0 0", color: "#666", fontSize: 14 }}>
            Всього подій: <strong>{data.total}</strong> · Сьогодні: <strong>{data.today}</strong>
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {(["all", "month", "week", "day"] as const).map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              style={{
                padding: "8px 16px", borderRadius: 8, border: "none", cursor: "pointer",
                fontWeight: 600, fontSize: 13,
                background: period === p ? "#22c55e" : "#e5e7eb",
                color: period === p ? "#fff" : "#333",
              }}>
              {p === "all" ? "Весь час" : p === "month" ? "Місяць" : p === "week" ? "Тиждень" : "День"}
            </button>
          ))}
        </div>
      </div>

      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12, marginBottom: 32 }}>
        {data.byType.map(et => (
          <div key={et.event_type} style={{
            background: EVENT_COLORS[et.event_type] ? `${EVENT_COLORS[et.event_type]}15` : "#f9fafb",
            padding: "16px 20px", borderRadius: 12, border: EVENT_COLORS[et.event_type] ? `1px solid ${EVENT_COLORS[et.event_type]}30` : "1px solid #e5e7eb",
          }}>
            <p style={{ margin: "0 0 4px", fontSize: 13, color: "#666", fontWeight: 500 }}>
              {EVENT_LABELS[et.event_type] || et.event_type}
            </p>
            <p style={{ margin: 0, fontSize: 28, fontWeight: 700, color: EVENT_COLORS[et.event_type] || "#333" }}>
              {et.count}
            </p>
          </div>
        ))}
      </div>

      {/* Chart - Events by Day */}
      <div style={{ background: "#fff", borderRadius: 16, padding: 24, marginBottom: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
        <h2 style={{ margin: "0 0 16px", fontSize: 18, fontWeight: 600 }}>Події по днях</h2>
        
        {/* Bar chart */}
        <div style={{ position: "relative", height: 200, display: "flex", alignItems: "flex-end", gap: 2, padding: "0 0 24px" }}>
          {dailyData.map((d, i) => {
            const dayTotal = eventTypes.reduce((sum, et) => sum + ((d as any)[et] || 0), 0);
            const heightPct = (dayTotal / maxDailyValue) * 100;
            return (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}
                title={`${d.day}: ${dayTotal} подій`}>
                <div style={{
                  width: "100%", maxWidth: 40, height: `${heightPct}%`,
                  background: "linear-gradient(180deg, #22c55e, #16a34a)",
                  borderRadius: "4px 4px 0 0", minHeight: dayTotal > 0 ? 4 : 0,
                  transition: "height 0.3s",
                }} />
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 8 }}>
          {eventTypes.map(et => (
            <span key={et} style={{ fontSize: 12, color: "#666", display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: EVENT_COLORS[et] || "#999", display: "inline-block" }} />
              {EVENT_LABELS[et] || et}
            </span>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 }}>
        {/* Product clicks */}
        <div style={{ background: "#fff", borderRadius: 16, padding: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <h2 style={{ margin: "0 0 16px", fontSize: 18, fontWeight: 600 }}>🛒 Кліки по товарах</h2>
          {data.byProduct.length === 0 ? (
            <p style={{ color: "#999", textAlign: "center", padding: 20 }}>Немає даних</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {data.byProduct.slice(0, 10).map((item, i) => {
                const max = Math.max(...data.byProduct.map(p => p.count));
                return (
                  <div key={i}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                      <span>{item.event_data}</span>
                      <span style={{ fontWeight: 600 }}>{item.count}</span>
                    </div>
                    <div style={{ background: "#f3f4f6", borderRadius: 8, height: 8, overflow: "hidden" }}>
                      <div style={{ width: `${(item.count / max) * 100}%`, height: "100%", background: "#f59e0b", borderRadius: 8 }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Application products */}
        <div style={{ background: "#fff", borderRadius: 16, padding: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <h2 style={{ margin: "0 0 16px", fontSize: 18, fontWeight: 600 }}>📝 Заявки по товарах</h2>
          {data.appProducts.length === 0 ? (
            <p style={{ color: "#999", textAlign: "center", padding: 20 }}>Немає даних</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {data.appProducts.slice(0, 10).map((item, i) => {
                const max = Math.max(...data.appProducts.map(p => p.count));
                return (
                  <div key={i}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                      <span>{item.product}</span>
                      <span style={{ fontWeight: 600 }}>{item.count}</span>
                    </div>
                    <div style={{ background: "#f3f4f6", borderRadius: 8, height: 8, overflow: "hidden" }}>
                      <div style={{ width: `${(item.count / max) * 100}%`, height: "100%", background: "#06b6d4", borderRadius: 8 }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 }}>
        {/* Phone clicks */}
        <div style={{ background: "#fff", borderRadius: 16, padding: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <h2 style={{ margin: "0 0 16px", fontSize: 18, fontWeight: 600 }}>📞 Дзвінки</h2>
          {data.phoneClicks.length === 0 ? (
            <p style={{ color: "#999", textAlign: "center", padding: 20 }}>Немає даних</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {data.phoneClicks.map((item, i) => {
                const max = Math.max(...data.phoneClicks.map(p => p.count));
                return (
                  <div key={i}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                      <span>{item.event_data || "Телефон"}</span>
                      <span style={{ fontWeight: 600 }}>{item.count}</span>
                    </div>
                    <div style={{ background: "#f3f4f6", borderRadius: 8, height: 8, overflow: "hidden" }}>
                      <div style={{ width: `${(item.count / max) * 100}%`, height: "100%", background: "#3b82f6", borderRadius: 8 }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* UTM Sources */}
        <div style={{ background: "#fff", borderRadius: 16, padding: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <h2 style={{ margin: "0 0 16px", fontSize: 18, fontWeight: 600 }}>🌐 Звідки приходять</h2>
          {data.utmStats.length === 0 ? (
            <p style={{ color: "#999", textAlign: "center", padding: 20 }}>Немає даних</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {data.utmStats.map((item, i) => {
                const max = Math.max(...data.utmStats.map(p => p.count));
                const sourceLabels: Record<string, string> = {
                  direct: "🔄 Прямий перехід",
                  google: "🔍 Google",
                  facebook: "📘 Facebook",
                  instagram: "📷 Instagram",
                  olx: "🛒 OLX",
                };
                return (
                  <div key={i}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                      <span>{sourceLabels[item.source] || item.source}</span>
                      <span style={{ fontWeight: 600 }}>{item.count}</span>
                    </div>
                    <div style={{ background: "#f3f4f6", borderRadius: 8, height: 8, overflow: "hidden" }}>
                      <div style={{ width: `${(item.count / max) * 100}%`, height: "100%", background: "#8b5cf6", borderRadius: 8 }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Application statuses */}
      <div style={{ background: "#fff", borderRadius: 16, padding: 24, marginBottom: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
        <h2 style={{ margin: "0 0 16px", fontSize: 18, fontWeight: 600 }}>📊 Статуси заявок</h2>
        {data.appStatuses.length === 0 ? (
          <p style={{ color: "#999", textAlign: "center", padding: 20 }}>Немає даних</p>
        ) : (
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
            {data.appStatuses.map((item) => {
              const total = data.appStatuses.reduce((sum, s) => sum + s.count, 0);
              const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;
              const statusColors: Record<string, string> = {
                new: "#3b82f6", read: "#8b5cf6", contacted: "#f59e0b",
                sent: "#22c55e", completed: "#16a34a", cancelled: "#ef4444",
              };
              const statusLabels: Record<string, string> = {
                new: "Нова", read: "Прочитана", contacted: "Зв'язались",
                sent: "Відправлено", completed: "Завершено", cancelled: "Скасовано",
              };
              return (
                <div key={item.status} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 12, height: 12, borderRadius: "50%", background: statusColors[item.status] || "#999" }} />
                  <span style={{ fontSize: 14 }}>{statusLabels[item.status] || item.status}:</span>
                  <strong style={{ fontSize: 14 }}>{item.count} ({pct}%)</strong>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Applications by Day */}
      <div style={{ background: "#fff", borderRadius: 16, padding: 24, marginBottom: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
        <h2 style={{ margin: "0 0 16px", fontSize: 18, fontWeight: 600 }}>📈 Заявки по днях</h2>
        {data.appsByDay.length === 0 ? (
          <p style={{ color: "#999", textAlign: "center", padding: 20 }}>Немає даних</p>
        ) : (
          <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 160, padding: "0 0 24px" }}>
            {data.appsByDay.map((item, i) => {
              const max = Math.max(...data.appsByDay.map(a => a.count));
              const heightPct = (item.count / max) * 100;
              return (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}
                  title={`${item.day}: ${item.count} заявок`}>
                  <div style={{
                    width: "100%", maxWidth: 30, height: `${heightPct}%`,
                    background: "linear-gradient(180deg, #06b6d4, #0891b2)",
                    borderRadius: "4px 4px 0 0", minHeight: item.count > 0 ? 4 : 0,
                  }} />
                  <span style={{ fontSize: 9, color: "#999", marginTop: 4, transform: "rotate(-45deg)", whiteSpace: "nowrap" }}>
                    {item.day?.slice(5)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Nav links */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 24 }}>
        {[
          { href: "/adminpanel/applications", label: "📝 Всі заявки" },
          { href: "/adminpanel/products", label: "🛒 Товари" },
          { href: "/adminpanel/dashboard", label: "🏠 Дашборд" },
        ].map(link => (
          <a key={link.href} href={link.href} style={{
            padding: "10px 20px", borderRadius: 10, background: "#fff",
            color: "#333", textDecoration: "none", fontSize: 14, fontWeight: 500,
            border: "1px solid #e5e7eb",
          }}>
            {link.label} →
          </a>
        ))}
      </div>
    </div>
  );
}
