import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import API from "../utils/api";

export default function Profile() {
  const { user, logout } = useAuth();
  const [account, setAccount] = useState(null);
  const [nameForm, setNameForm] = useState({ name: "" });
  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [nameMsg, setNameMsg] = useState({ type: "", text: "" });
  const [pwMsg, setPwMsg] = useState({ type: "", text: "" });
  const [nameLoading, setNameLoading] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);

  useEffect(() => {
    setNameForm({ name: user?.name || "" });
    if (user?.role === "customer") {
      API.get("/account").then(r => setAccount(r.data)).catch(() => {});
    }
  }, [user]);

  const handleNameUpdate = async (e) => {
    e.preventDefault();
    setNameMsg({ type: "", text: "" }); setNameLoading(true);
    try {
      const res = await API.put("/auth/profile", { name: nameForm.name });
      // Update stored user name
      const stored = JSON.parse(localStorage.getItem("user") || "{}");
      stored.name = res.data.user.name;
      localStorage.setItem("user", JSON.stringify(stored));
      setNameMsg({ type: "success", text: "Name updated successfully! Refresh to see it in sidebar." });
    } catch (err) {
      setNameMsg({ type: "error", text: err.response?.data?.message || "Update failed" });
    } finally { setNameLoading(false); }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setPwMsg({ type: "", text: "" });
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwMsg({ type: "error", text: "New passwords do not match" }); return;
    }
    if (pwForm.newPassword.length < 6) {
      setPwMsg({ type: "error", text: "Password must be at least 6 characters" }); return;
    }
    setPwLoading(true);
    try {
      await API.put("/auth/profile", {
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      setPwMsg({ type: "success", text: "Password changed successfully!" });
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setPwMsg({ type: "error", text: err.response?.data?.message || "Password update failed" });
    } finally { setPwLoading(false); }
  };

  const fmt = (n) => "₹" + Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2 });

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>My Profile</h1>
      <p style={{ color: "var(--muted)", marginBottom: 28, fontSize: 14 }}>Manage your account details and security</p>

      <div style={styles.grid}>
        {/* Left column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Avatar card */}
          <div style={styles.avatarCard}>
            <div style={styles.bigAvatar}>{user?.name?.[0]?.toUpperCase()}</div>
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 800 }}>{user?.name}</h2>
              <p style={{ color: "var(--muted)", fontSize: 14, marginTop: 4 }}>{user?.email}</p>
              <span style={{
                display: "inline-block", marginTop: 8,
                padding: "4px 12px", borderRadius: 8, fontSize: 12, fontWeight: 700,
                fontFamily: "var(--font-head)", textTransform: "capitalize",
                background: user?.role === "admin" ? "rgba(108,99,255,0.15)" : "rgba(34,211,160,0.15)",
                color: user?.role === "admin" ? "var(--accent2)" : "var(--green)",
              }}>{user?.role}</span>
            </div>
          </div>

          {/* Account Info (customers only) */}
          {user?.role === "customer" && account && (
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>Account Details</h3>
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Account ID</span>
                <span style={{ fontFamily: "monospace", fontSize: 13, color: "var(--accent2)" }}>{account.accountId}</span>
              </div>
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Type</span>
                <span style={{ textTransform: "capitalize" }}>{account.accountType}</span>
              </div>
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Status</span>
                <span className={`badge badge-${account.status}`}>{account.status}</span>
              </div>
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Balance</span>
                <span style={{ fontWeight: 700, color: "var(--green)", fontFamily: "var(--font-head)", fontSize: 18 }}>
                  {fmt(account.balance)}
                </span>
              </div>
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Opened</span>
                <span style={{ color: "var(--muted)", fontSize: 13 }}>
                  {new Date(account.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Right column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Update Name */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Update Name</h3>
            <form onSubmit={handleNameUpdate} style={styles.form}>
              <div style={styles.field}>
                <label style={styles.label}>Full Name</label>
                <input
                  value={nameForm.name}
                  onChange={(e) => setNameForm({ name: e.target.value })}
                  placeholder="Your full name"
                  required
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Email</label>
                <input value={user?.email} disabled style={{ opacity: 0.5, cursor: "not-allowed" }} />
              </div>
              {nameMsg.text && (
                <p style={{ color: nameMsg.type === "success" ? "var(--green)" : "var(--red)", fontSize: 13 }}>
                  {nameMsg.text}
                </p>
              )}
              <button type="submit" className="btn-primary" disabled={nameLoading}>
                {nameLoading ? "Saving..." : "Save Name"}
              </button>
            </form>
          </div>

          {/* Change Password */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Change Password</h3>
            <form onSubmit={handlePasswordUpdate} style={styles.form}>
              <div style={styles.field}>
                <label style={styles.label}>Current Password</label>
                <input
                  type="password" placeholder="Enter current password"
                  value={pwForm.currentPassword}
                  onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })}
                  required
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>New Password</label>
                <input
                  type="password" placeholder="Min 6 characters"
                  value={pwForm.newPassword}
                  onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
                  required
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Confirm New Password</label>
                <input
                  type="password" placeholder="Repeat new password"
                  value={pwForm.confirmPassword}
                  onChange={(e) => setPwForm({ ...pwForm, confirmPassword: e.target.value })}
                  required
                />
              </div>
              {pwMsg.text && (
                <p style={{ color: pwMsg.type === "success" ? "var(--green)" : "var(--red)", fontSize: 13 }}>
                  {pwMsg.text}
                </p>
              )}
              <button type="submit" className="btn-primary" disabled={pwLoading}>
                {pwLoading ? "Updating..." : "Change Password"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {},
  title: { fontSize: 28, fontWeight: 800, marginBottom: 4 },
  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, alignItems: "start" },
  avatarCard: {
    background: "linear-gradient(135deg, #1a1a2e, #16213e)",
    border: "1.5px solid rgba(108,99,255,0.3)",
    borderRadius: 18, padding: "28px 24px",
    display: "flex", alignItems: "center", gap: 20,
  },
  bigAvatar: {
    width: 64, height: 64, borderRadius: "50%", flexShrink: 0,
    background: "linear-gradient(135deg, var(--accent), var(--accent2))",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontWeight: 800, fontSize: 26, color: "#fff",
  },
  card: {
    background: "var(--card)", border: "1.5px solid var(--border)",
    borderRadius: 16, padding: "24px",
  },
  cardTitle: { fontSize: 16, fontWeight: 700, marginBottom: 18, fontFamily: "var(--font-head)" },
  form: { display: "flex", flexDirection: "column", gap: 14 },
  field: { display: "flex", flexDirection: "column", gap: 6 },
  label: { fontSize: 13, fontWeight: 600, color: "var(--muted)", fontFamily: "var(--font-head)" },
  infoRow: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "10px 0", borderBottom: "1px solid var(--border)", fontSize: 14,
  },
  infoLabel: { color: "var(--muted)", fontSize: 13, fontWeight: 600 },
};
