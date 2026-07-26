"use client";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const [stats, setStats] = useState<any>({});

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    fetch("/api/admin/content/applications", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        const apps = Array.isArray(data) ? data : [];
        setStats({
          total_apps: apps.length,
          new_apps: apps.filter((a: any) => a.status === "new").length,
          last_app: apps[0] || null,
        });
      });
  }, []);

  return (
    <div>
      <h1>📊 Дашборд</h1>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, marginTop: 20 }}>
        <div style={{ background: "#fff", padding: 20, borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
          <h3>Всього заявок</h3>
          <p style={{ fontSize: 32, fontWeight: "bold", color: "#1a6b3c" }}>{stats.total_apps || 0}</p>
        </div>
        <div style={{ background: "#fff", padding: 20, borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
          <h3>Нові заявки</h3>
          <p style={{ fontSize: 32, fontWeight: "bold", color: "#e67e22" }}>{stats.new_apps || 0}</p>
        </div>
        <div style={{ background: "#fff", padding: 20, borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
          <h3>Email адміна</h3>
          <p style={{ fontSize: 16, fontWeight: "bold" }}>{localStorage.getItem("admin_email")}</p>
        </div>
      </div>
      <div style={{ marginTop: 30 }}>
        <a href="/adminpanel/applications" style={{ color: "#1a6b3c", fontWeight: "bold" }}>
          📋 Перейти до заявок →
        </a>
      </div>
    </div>
  );
}
