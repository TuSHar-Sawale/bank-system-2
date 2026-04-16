import React, { useState } from "react";
import API from "../utils/api";

const TABS = ["deposit", "withdraw", "transfer"];

export default function Transfer() {
  const [tab, setTab] = useState("deposit");
  const [amount, setAmount] = useState("");
  const [toAccountId, setToAccountId] = useState("");
  const [description, setDescription] = useState("");
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);

  const reset = () => { setAmount(""); setToAccountId(""); setDescription(""); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg({ type: "", text: "" }); setLoading(true);
    try {
      let res;
      if (tab === "deposit") res = await API.post("/transactions/deposit", { amount: Number(amount) });
      else if (tab === "withdraw") res = await API.post("/transactions/withdraw", { amount: Number(amount) });
      else res = await API.post("/transactions/transfer", { toAccountId, amount: Number(amount), description });
      setMsg({ type: "success", text: res.data.message + ` | New Balance: ₹${Number(res.data.balance).toLocaleString("en-IN")}` });
      reset();
    } catch (err) {
      setMsg({ type: "error", text: err.response?.data?.message || "Transaction failed" });
    } finally { setLoading(false); }
  };

  const icons = { deposit: "↓", withdraw: "↑", transfer: "⇄" };
  const colors = { deposit: "var(--green)", withdraw: "var(--red)", transfer: "var(--accent2)" };

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>Money Operations</h1>
      <p style={{ color: "var(--muted)", marginBottom: 28, fontSize: 14 }}>Deposit, withdraw or send money</p>

      {/* Tab selector */}
      <div style={styles.tabs}>
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); setMsg({ type: "", text: "" }); reset(); }}
            style={{
              ...styles.tab,
              ...(tab === t ? { ...styles.tabActive, borderColor: colors[t], color: colors[t] } : {}),
            }}
          >
            <span style={{ fontSize: 18 }}>{icons[t]}</span>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Form */}
      <div style={styles.card}>
        <div style={{ ...styles.cardAccent, background: colors[tab] }}></div>
        <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>
          {tab.charAt(0).toUpperCase() + tab.slice(1)} Funds
        </h3>

        <form onSubmit={handleSubmit} style={styles.form}>
          {tab === "transfer" && (
            <div style={styles.field}>
              <label style={styles.label}>Recipient Account ID</label>
              <input
                placeholder="e.g. ACC1234567890"
                value={toAccountId}
                onChange={(e) => setToAccountId(e.target.value)}
                required
              />
            </div>
          )}

          <div style={styles.field}>
            <label style={styles.label}>Amount (₹)</label>
            <input
              type="number" min="1" step="0.01"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          {tab === "transfer" && (
            <div style={styles.field}>
              <label style={styles.label}>Description (optional)</label>
              <input
                placeholder="e.g. Rent payment"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          )}

          {msg.text && (
            <p style={{ color: msg.type === "success" ? "var(--green)" : "var(--red)", fontSize: 13 }}>
              {msg.text}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.submitBtn,
              background: colors[tab],
              boxShadow: `0 4px 24px ${colors[tab]}33`,
            }}
          >
            {loading ? "Processing..." : `Confirm ${tab.charAt(0).toUpperCase() + tab.slice(1)}`}
          </button>
        </form>
      </div>

      {/* Tips */}
      <div style={styles.tip}>
        <p style={{ color: "var(--muted)", fontSize: 13 }}>
          {tab === "deposit" && "💡 Funds will be credited to your account immediately."}
          {tab === "withdraw" && "💡 Ensure you have sufficient balance before withdrawing."}
          {tab === "transfer" && "💡 Double-check the recipient's Account ID before sending."}
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: { maxWidth: 540 },
  title: { fontSize: 28, fontWeight: 800, marginBottom: 4 },
  tabs: { display: "flex", gap: 10, marginBottom: 24 },
  tab: {
    flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
    background: "var(--card)", border: "1.5px solid var(--border)",
    color: "var(--muted)", borderRadius: 12, padding: "12px",
    fontFamily: "var(--font-head)", fontWeight: 600, fontSize: 14,
    cursor: "pointer", transition: "all 0.2s",
  },
  tabActive: { background: "var(--card2)" },
  card: {
    background: "var(--card)", border: "1.5px solid var(--border)",
    borderRadius: 18, padding: "28px 28px 28px",
    position: "relative", overflow: "hidden", marginBottom: 16,
  },
  cardAccent: {
    position: "absolute", top: 0, left: 0, right: 0, height: 3, opacity: 0.7,
  },
  form: { display: "flex", flexDirection: "column", gap: 16 },
  field: { display: "flex", flexDirection: "column", gap: 6 },
  label: { fontSize: 13, fontWeight: 600, color: "var(--muted)", fontFamily: "var(--font-head)" },
  submitBtn: {
    color: "#fff", border: "none", borderRadius: 12,
    padding: "14px", fontSize: 16, fontWeight: 700,
    fontFamily: "var(--font-head)", cursor: "pointer",
    transition: "opacity 0.2s, transform 0.15s", marginTop: 4,
  },
  tip: {
    background: "var(--card2)", border: "1.5px solid var(--border)",
    borderRadius: 12, padding: "14px 16px",
  },
};
