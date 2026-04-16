import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setSuccess(""); setLoading(true);
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false); return;
    }
    try {
      await register(form.name, form.email, form.password);
      setSuccess("Account created successfully! You can now log in.");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally { setLoading(false); }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logo}>
          <span style={styles.dot}></span>
          <span style={styles.name}>NexBank</span>
        </div>
        <h2 style={styles.title}>Open an account</h2>
        <p style={styles.sub}>Takes less than a minute</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Full Name</label>
            <input
              placeholder="John Doe" value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
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
              type="password" placeholder="Min 6 characters" value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>
          {error && <p className="error">{error}</p>}
          {success && <p className="success">{success}</p>}
          <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: 8 }}>
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p style={styles.footer}>
          Already have an account? <Link to="/login" style={styles.link}>Sign in</Link>
        </p>
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
    position: "absolute", bottom: "-30%", left: "-20%",
    width: 600, height: 600, borderRadius: "50%",
    background: "radial-gradient(circle, rgba(167,139,250,0.10) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  card: {
    background: "var(--card)", border: "1.5px solid var(--border)",
    borderRadius: 20, padding: "40px 36px", width: "100%", maxWidth: 420, position: "relative", zIndex: 1,
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
};
