"use client";
import { useEffect, useState } from "react";

const DEFAULT_STATUSES = ["new", "read", "contacted", "sent", "completed", "cancelled"];
const STATUS_COLORS: Record<string, string> = {
  new: "#3b82f6", read: "#8b5cf6", contacted: "#f59e0b",
  sent: "#22c55e", completed: "#16a34a", cancelled: "#ef4444",
};
const STATUS_LABELS: Record<string, string> = {
  new: "Нова", read: "Прочитана", contacted: "Зв'язались",
  sent: "Відправлено", completed: "Завершено", cancelled: "Скасовано",
};

export default function ApplicationsPage() {
  const [apps, setApps] = useState<any[]>([]);
  const [statuses, setStatuses] = useState<string[]>(DEFAULT_STATUSES);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<number | null>(null);
  const [newStatusName, setNewStatusName] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : "";

  const load = async () => {
    try {
      const r = await fetch("/api/admin/content/applications", { headers: { Authorization: `Bearer ${token}` } });
      const data = await r.json();
      setApps(Array.isArray(data) ? data : []);
    } catch {}
    setLoading(false);
  };

  // Also load custom statuses from localStorage
  useEffect(() => {
    load();
    const saved = localStorage.getItem("app_statuses");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setStatuses([...DEFAULT_STATUSES, ...parsed.filter((s: string) => !DEFAULT_STATUSES.includes(s))]);
      } catch {}
    }
  }, []);

  const changeStatus = async (id: number, status: string) => {
    // Update in DB
    try {
      await fetch(`/api/admin/content/applications`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id, status }),
      });
    } catch {}
    setApps(apps.map(a => a.id === id ? { ...a, status } : a));
  };

  const addStatus = () => {
    const name = newStatusName.trim().toLowerCase().replace(/\s+/g, "_");
    if (!name || statuses.includes(name)) return;
    const updated = [...statuses, name];
    setStatuses(updated);
    localStorage.setItem("app_statuses", JSON.stringify(updated.filter(s => !DEFAULT_STATUSES.includes(s))));
    setNewStatusName("");
  };

  const removeStatus = (name: string) => {
    if (DEFAULT_STATUSES.includes(name)) return;
    const updated = statuses.filter(s => s !== name);
    setStatuses(updated);
    localStorage.setItem("app_statuses", JSON.stringify(updated.filter(s => !DEFAULT_STATUSES.includes(s))));
  };

  const filtered = filterStatus === "all" ? apps : apps.filter(a => a.status === filterStatus);

  if (loading) return <p>Завантаження...</p>;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
        <h1 style={{ margin: 0, fontSize: 22 }}>Заявки</h1>
        <span style={{ fontSize: 14, color: "#666" }}>Всього: {apps.length}</span>
      </div>

      {/* Status filter chips */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
        <button onClick={() => setFilterStatus("all")} style={chipStyle(filterStatus === "all" ? "#333" : "#e5e7eb", filterStatus === "all" ? "#fff" : "#333")}>
          Всі ({apps.length})
        </button>
        {statuses.map(s => (
          <button key={s} onClick={() => setFilterStatus(s)} style={chipStyle(filterStatus === s ? (STATUS_COLORS[s] || "#666") : "#e5e7eb", filterStatus === s ? "#fff" : "#333")}>
            {STATUS_LABELS[s] || s} ({apps.filter(a => a.status === s).length})
          </button>
        ))}
      </div>

      {/* Custom status creator */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, alignItems: "center" }}>
        <input value={newStatusName} onChange={e => setNewStatusName(e.target.value)}
          placeholder="Назва нового статусу" style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 14, flex: 1, maxWidth: 250 }}
          onKeyDown={e => e.key === "Enter" && addStatus()} />
        <button onClick={addStatus} style={{ padding: "8px 14px", borderRadius: 8, border: "none", background: "#22c55e", color: "#fff", cursor: "pointer", fontWeight: 600, fontSize: 13 }}>
          + Статус
        </button>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {statuses.filter(s => !DEFAULT_STATUSES.includes(s)).map(s => (
            <span key={s} style={{ padding: "4px 10px", borderRadius: 12, background: "#e5e7eb", fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}>
              {STATUS_LABELS[s] || s} <button onClick={() => removeStatus(s)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, color: "#999", padding: 0 }}>×</button>
            </span>
          ))}
        </div>
      </div>

      {/* Applications list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: 60, color: "#999" }}>
            <p style={{ fontSize: 48, marginBottom: 10 }}>📭</p>
            <p>Немає заявок</p>
          </div>
        )}
        {filtered.map((app: any) => (
          <div key={app.id} onClick={() => setSelected(selected === app.id ? null : app.id)}
            style={{
              background: "#fff", borderRadius: 12, padding: "16px 20px",
              boxShadow: "0 1px 4px rgba(0,0,0,0.08)", cursor: "pointer",
              borderLeft: `4px solid ${STATUS_COLORS[app.status] || "#ccc"}`,
            }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <strong style={{ fontSize: 16 }}>{app.name}</strong>
                <span style={{ marginLeft: 10, fontSize: 13, color: "#666" }}>📞 {app.phone}</span>
              </div>
              <span style={{ fontSize: 12, color: "#999", whiteSpace: "nowrap" }}>
                {app.created_at ? new Date(app.created_at).toLocaleString("uk-UA") : ""}
              </span>
            </div>

            {selected === app.id && (
              <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #eee" }}>
                {app.email && <p style={{ margin: "4px 0", fontSize: 14 }}>📧 {app.email}</p>}
                {app.product && <p style={{ margin: "4px 0", fontSize: 14 }}>📦 {app.product}</p>}
                {app.message && <p style={{ margin: "4px 0", fontSize: 14, color: "#555" }}>💬 {app.message}</p>}

                <div style={{ marginTop: 12 }}>
                  <label style={{ fontSize: 13, color: "#666", display: "block", marginBottom: 4 }}>Статус:</label>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {statuses.map(s => (
                      <button key={s} onClick={() => changeStatus(app.id, s)}
                        style={{
                          padding: "4px 12px", borderRadius: 12, border: "none", cursor: "pointer",
                          fontSize: 12, fontWeight: app.status === s ? 700 : 400,
                          background: app.status === s ? (STATUS_COLORS[s] || "#666") : "#f3f4f6",
                          color: app.status === s ? "#fff" : "#333",
                        }}>
                        {STATUS_LABELS[s] || s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function chipStyle(bg: string, color: string): React.CSSProperties {
  return {
    padding: "6px 14px", borderRadius: 20, border: "none", cursor: "pointer",
    fontSize: 13, fontWeight: 500, background: bg, color, transition: "all 0.2s",
  };
}
