import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const user = await login(form.email, form.password);
      navigate(user.role === "admin" ? "/admin" : "/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally { setLoading(false); }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logo}>
          <span style={styles.dot}></span>
          <span style={styles.name}>NexBank</span>
        </div>
        <h2 style={styles.title}>Welcome back</h2>
        <p style={styles.sub}>Sign in to your account</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input
              type="email" placeholder="you@email.com" value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              type="password" placeholder="••••••••" value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>
          {error && <p className="error">{error}</p>}
          <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: 8 }}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p style={styles.footer}>
          No account? <Link to="/register" style={styles.link}>Register here</Link>
        </p>

        <div style={styles.hint}>
          <p style={{ color: "var(--muted)", fontSize: 12, textAlign: "center" }}>
            Admin: admin@bank.com / Admin@1234
          </p>
        </div>
      </div>

      <div style={styles.bg}></div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
    background: "var(--bg)", position: "relative", overflow: "hidden",
  },
  bg: {
    position: "absolute", top: "-30%", right: "-20%",
    width: 600, height: 600, borderRadius: "50%",
    background: "radial-gradient(circle, rgba(108,99,255,0.12) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  card: {
    background: "var(--card)", border: "1.5px solid var(--border)",
    borderRadius: 20, padding: "40px 36px", width: "100%", maxWidth: 420,
    position: "relative", zIndex: 1,
  },
  logo: { display: "flex", alignItems: "center", gap: 10, marginBottom: 28 },
  dot: {
    width: 26, height: 26, borderRadius: "50%",
    background: "linear-gradient(135deg, var(--accent), var(--accent2))", display: "block",
  },
  name: { fontFamily: "var(--font-head)", fontWeight: 800, fontSize: 20 },
  title: { fontSize: 26, fontWeight: 800, marginBottom: 6 },
  sub: { color: "var(--muted)", marginBottom: 28, fontSize: 14 },
  form: { display: "flex", flexDirection: "column", gap: 16 },
  field: { display: "flex", flexDirection: "column", gap: 6 },
  label: { fontSize: 13, fontWeight: 600, color: "var(--muted)", fontFamily: "var(--font-head)" },
  footer: { marginTop: 20, textAlign: "center", color: "var(--muted)", fontSize: 14 },
  link: { color: "var(--accent2)", fontWeight: 600 },
  hint: { marginTop: 16, padding: "10px", background: "var(--card2)", borderRadius: 8 },
};
