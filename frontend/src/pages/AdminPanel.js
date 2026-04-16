import React, { useEffect, useState } from "react";
import API from "../utils/api";

const TABS = ["stats", "users", "transactions"];

export default function AdminPanel() {
  const [tab, setTab] = useState("stats");
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [txns, setTxns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => { loadData(); }, [tab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (tab === "stats") {
        const r = await API.get("/admin/stats");
        setStats(r.data);
      } else if (tab === "users") {
        const r = await API.get("/admin/users");
        setUsers(r.data);
      } else {
        const r = await API.get("/admin/transactions");
        setTxns(r.data);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const approveUser = async (userId, name) => {
    try {
      await API.put(`/admin/approve/${userId}`);
      setMsg(`✅ ${name} approved`);
      loadData();
    } catch (err) { setMsg("Error: " + err.response?.data?.message); }
  };

  const toggleFreeze = async (accountId, status) => {
    try {
      await API.put(`/admin/freeze/${accountId}`);
      setMsg(`Account ${status === "frozen" ? "unfrozen" : "frozen"}`);
      loadData();
    } catch (err) { setMsg("Error: " + err.response?.data?.message); }
  };

  const fmt = (n) => "₹" + Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2 });

  return (
    <div>
      <h1 style={styles.title}>Admin Panel</h1>
      <p style={{ color: "var(--muted)", marginBottom: 24, fontSize: 14 }}>Manage users, accounts and monitor activity</p>

      {msg && (
        <div style={styles.msgBar} onClick={() => setMsg("")}>
          {msg} <span style={{ marginLeft: 12, cursor: "pointer", opacity: 0.6 }}>✕</span>
        </div>
      )}

      {/* Tabs */}
      <div style={styles.tabs}>
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)}
            style={{ ...styles.tab, ...(tab === t ? styles.tabActive : {}) }}>
            {{ stats: "📊", users: "👥", transactions: "💳" }[t]} {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {loading && <p style={{ color: "var(--muted)", padding: "20px 0" }}>Loading...</p>}

      {/* Stats */}
      {!loading && tab === "stats" && stats && (
        <div style={styles.statsGrid}>
          {[
            { label: "Total Customers", value: stats.totalUsers, color: "var(--accent2)" },
            { label: "Active Accounts", value: stats.activeAccounts, color: "var(--green)" },
            { label: "Pending Approval", value: stats.pendingAccounts, color: "var(--yellow)" },
            { label: "Frozen Accounts", value: stats.frozenAccounts, color: "var(--red)" },
            { label: "Total Transactions", value: stats.totalTransactions, color: "var(--accent)" },
            { label: "Total Balance", value: fmt(stats.totalBalance), color: "var(--green)" },
          ].map((s) => (
            <div key={s.label} style={{ ...styles.statCard, borderColor: s.color + "33" }}>
              <p style={{ color: "var(--muted)", fontSize: 12, fontWeight: 600, marginBottom: 8 }}>{s.label}</p>
              <p style={{ fontSize: 28, fontWeight: 800, color: s.color, fontFamily: "var(--font-head)" }}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Users */}
      {!loading && tab === "users" && (
        <div style={styles.tableCard}>
          <div style={styles.tableHead}>
            <span>Name / Email</span>
            <span>Account ID</span>
            <span>Balance</span>
            <span>Status</span>
            <span>Actions</span>
          </div>
          {users.length === 0 ? (
            <p style={{ padding: 24, color: "var(--muted)" }}>No users found.</p>
          ) : users.map((u) => (
            <div key={u._id} style={styles.tableRow}>
              <div>
                <p style={{ fontWeight: 600, fontSize: 14 }}>{u.name}</p>
                <p style={{ color: "var(--muted)", fontSize: 12 }}>{u.email}</p>
              </div>
              <div style={{ fontFamily: "monospace", fontSize: 12, color: "var(--muted)" }}>
                {u.account?.accountId || "—"}
              </div>
              <div style={{ fontWeight: 700, color: "var(--green)", fontFamily: "var(--font-head)" }}>
                {u.account ? fmt(u.account.balance) : "—"}
              </div>
              <div>
                {u.account ? (
                  <span className={`badge badge-${u.account.status}`}>{u.account.status}</span>
                ) : "—"}
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {!u.isActive && (
                  <button onClick={() => approveUser(u._id, u.name)}
                    className="btn-success btn-sm">Approve</button>
                )}
                {u.account && u.account.status !== "pending" && (
                  <button
                    onClick={() => toggleFreeze(u.account.accountId, u.account.status)}
                    className={u.account.status === "frozen" ? "btn-success btn-sm" : "btn-danger btn-sm"}>
                    {u.account.status === "frozen" ? "Unfreeze" : "Freeze"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Transactions */}
      {!loading && tab === "transactions" && (
        <div style={styles.tableCard}>
          <div style={{ ...styles.tableHead, gridTemplateColumns: "1.5fr 1fr 1fr 1fr 1fr" }}>
            <span>Transaction ID</span>
            <span>Type</span>
            <span>Amount</span>
            <span>Status</span>
            <span>Date</span>
          </div>
          {txns.length === 0 ? (
            <p style={{ padding: 24, color: "var(--muted)" }}>No transactions.</p>
          ) : txns.map((t) => (
            <div key={t._id} style={{ ...styles.tableRow, gridTemplateColumns: "1.5fr 1fr 1fr 1fr 1fr" }}>
              <div style={{ fontFamily: "monospace", fontSize: 12, color: "var(--muted)" }}>{t.transactionId}</div>
              <div>
                <span style={{
                  padding: "3px 8px", borderRadius: 6, fontSize: 12, fontWeight: 600,
                  background: { deposit: "rgba(34,211,160,0.15)", withdrawal: "rgba(255,107,107,0.15)", transfer: "rgba(108,99,255,0.15)" }[t.type],
                  color: { deposit: "var(--green)", withdrawal: "var(--red)", transfer: "var(--accent2)" }[t.type],
                }}>{t.type}</span>
              </div>
              <div style={{ fontWeight: 700, fontFamily: "var(--font-head)" }}>{fmt(t.amount)}</div>
              <div><span className={`badge badge-active`}>{t.status}</span></div>
              <div style={{ color: "var(--muted)", fontSize: 13 }}>
                {new Date(t.createdAt).toLocaleDateString("en-IN")}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  title: { fontSize: 28, fontWeight: 800, marginBottom: 4 },
  msgBar: {
    background: "rgba(108,99,255,0.15)", border: "1.5px solid rgba(108,99,255,0.3)",
    borderRadius: 10, padding: "12px 16px", marginBottom: 16,
    color: "var(--accent2)", fontSize: 14, display: "flex", alignItems: "center",
    cursor: "pointer",
  },
  tabs: { display: "flex", gap: 10, marginBottom: 24 },
  tab: {
    background: "var(--card)", border: "1.5px solid var(--border)",
    color: "var(--muted)", borderRadius: 10, padding: "10px 20px",
    fontFamily: "var(--font-head)", fontWeight: 600, fontSize: 14,
    cursor: "pointer", transition: "all 0.2s",
  },
  tabActive: {
    background: "rgba(108,99,255,0.15)",
    borderColor: "rgba(108,99,255,0.4)",
    color: "var(--accent2)",
  },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 },
  statCard: {
    background: "var(--card)", border: "1.5px solid var(--border)",
    borderRadius: 14, padding: "20px",
  },
  tableCard: {
    background: "var(--card)", border: "1.5px solid var(--border)",
    borderRadius: 14, overflow: "hidden",
  },
  tableHead: {
    display: "grid", gridTemplateColumns: "2fr 1.5fr 1fr 1fr 1.5fr",
    padding: "14px 20px", background: "var(--card2)",
    color: "var(--muted)", fontSize: 12, fontWeight: 600,
    fontFamily: "var(--font-head)", borderBottom: "1.5px solid var(--border)",
  },
  tableRow: {
    display: "grid", gridTemplateColumns: "2fr 1.5fr 1fr 1fr 1.5fr",
    padding: "16px 20px", alignItems: "center",
    borderBottom: "1px solid var(--border)",
  },
};
