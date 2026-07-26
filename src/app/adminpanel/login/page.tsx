"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

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
        localStorage.setItem("admin_token", data.token);
        localStorage.setItem("admin_email", data.email);
        router.push("/adminpanel/dashboard");
      }
    } catch {
      setError("Помилка мережі");
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 400, margin: "100px auto", padding: 20 }}>
      <h1 style={{ textAlign: "center", marginBottom: 30 }}>Вхід в адмін-панель</h1>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 15 }}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ padding: 12, fontSize: 16, borderRadius: 8, border: "1px solid #ccc" }}
        />
        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ padding: 12, fontSize: 16, borderRadius: 8, border: "1px solid #ccc" }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: 12, fontSize: 16, borderRadius: 8, border: "none",
            background: "#1a6b3c", color: "#fff", cursor: "pointer", fontWeight: "bold"
          }}
        >
          {loading ? "Вхід..." : "Увійти"}
        </button>
        {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}
      </form>
    </div>
  );
}
