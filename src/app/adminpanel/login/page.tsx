"use client";
import { useState } from "react";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Помилка входу");
      } else {
        localStorage.removeItem("admin_token");
        localStorage.removeItem("admin_email");
        localStorage.setItem("admin_token", data.token);
        localStorage.setItem("admin_email", data.email);
        window.location.href = "/adminpanel/dashboard";
      }
    } catch {
      setError("Помилка мережі");
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 20,
    }}>
      <div style={{
        background: "#fff", borderRadius: 20, padding: 48, width: "100%", maxWidth: 420,
        boxShadow: "0 25px 50px rgba(0,0,0,0.25)",
      }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" style={{ marginBottom: 16 }}>
            <path d="M12 2L2 7l10 5 10-5-10-5z" fill="#22c55e"/>
            <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="#22c55e" strokeWidth="2" fill="none"/>
          </svg>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 4px" }}>KTK Адмін-панель</h1>
          <p style={{ color: "#666", fontSize: 14, margin: 0 }}>Увійдіть для керування сайтом</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Email</label>
            <input
              type="email" placeholder="admin@ktk.com.ua"
              value={email} onChange={(e) => setEmail(e.target.value)}
              required
              style={inputStyle}
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Пароль</label>
            <input
              type="password" placeholder="••••••••"
              value={password} onChange={(e) => setPassword(e.target.value)}
              required
              style={inputStyle}
            />
          </div>

          {error && (
            <div style={{
              padding: "10px 14px", background: "#fef2f2", borderRadius: 10,
              color: "#dc2626", fontSize: 13, border: "1px solid #fecaca",
            }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading}
            style={{
              padding: "12px 20px", fontSize: 15, fontWeight: 600,
              borderRadius: 12, border: "none",
              background: "linear-gradient(135deg, #22c55e, #16a34a)",
              color: "#fff", cursor: "pointer",
              opacity: loading ? 0.7 : 1,
              transition: "opacity 0.2s",
            }}
          >
            {loading ? "Вхід..." : "Увійти"}
          </button>
        </form>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "10px 14px", fontSize: 15,
  borderRadius: 10, border: "1px solid #d1d5db",
  outline: "none", boxSizing: "border-box",
  transition: "border-color 0.2s",
};
