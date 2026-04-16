import React, { useEffect, useState, useCallback } from "react";
import API from "../utils/api";

const TABS = ["overview", "users", "transactions"];

export default function AdminPanel() {
  const [tab, setTab] = useState("overview");
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [txns, setTxns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      if (tab === "overview") {
        const [sRes, tRes] = await Promise.all([API.get("/admin/stats"), API.get("/admin/transactions")]);
        setStats(sRes.data);
        setTxns(tRes.data.slice(0, 8));
      } else if (tab === "users") {
        const r = await API.get("/admin/users");
        setUsers(r.data);
      } else {
        const r = await API.get("/admin/transactions");
        setTxns(r.data);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [tab]);

  useEffect(() => { loadData(); }, [loadData]);

  const toggleFreeze = async (accountId, status) => {
    try {
      await API.put(`/admin/freeze/${accountId}`);
      showToast(`Account ${status === "frozen" ? "unfrozen ✓" : "frozen ✓"}`);
      loadData();
    } catch (err) { showToast("Error: " + (err.response?.data?.message || "failed")); }
  };

  const fmt = (n) => "₹" + Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2 });
  const fmtShort = (n) => {
    if (n >= 10000000) return "₹" + (n / 10000000).toFixed(1) + "Cr";
    if (n >= 100000) return "₹" + (n / 100000).toFixed(1) + "L";
    if (n >= 1000) return "₹" + (n / 1000).toFixed(1) + "K";
    return "₹" + n;
  };

  const typeColors = { deposit: "var(--green)", withdrawal: "var(--red)", transfer: "var(--accent2)" };
  const typeIcons = { deposit: "↓", withdrawal: "↑", transfer: "⇄" };

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div style={styles.toast}>{toast}</div>
      )}

      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Admin Panel</h1>
          <p style={{ color: "var(--muted)", fontSize: 14 }}>Bank overview, user management & monitoring</p>
        </div>
        <button onClick={loadData} style={styles.refreshBtn}>↺ Refresh</button>
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)}
            style={{ ...styles.tab, ...(tab === t ? styles.tabActive : {}) }}>
            {{ overview: "📊", users: "👥", transactions: "💳" }[t]}
            {" "}{t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {loading && <p style={{ color: "var(--muted)", padding: "20px 0" }}>Loading...</p>}

      {/* ── OVERVIEW TAB ── */}
      {!loading && tab === "overview" && stats && (
        <div>
          {/* KPI grid */}
          <div style={styles.kpiGrid}>
            {[
              { label: "Total Customers", value: stats.totalUsers, color: "var(--accent2)", icon: "👤", sub: `+${stats.newUsers} this week` },
              { label: "Active Accounts", value: stats.activeAccounts, color: "var(--green)", icon: "✓", sub: `${stats.frozenAccounts} frozen` },
              { label: "Total Transactions", value: stats.totalTransactions, color: "var(--accent)", icon: "⇄", sub: `+${stats.recentTxns} this week` },
              { label: "Total Bank Balance", value: fmtShort(stats.totalBalance), color: "var(--yellow)", icon: "₹", sub: fmt(stats.totalBalance) },
            ].map((k) => (
              <div key={k.label} style={{ ...styles.kpiCard, borderColor: k.color + "33" }}>
                <div style={{ ...styles.kpiIcon, background: k.color + "18", color: k.color }}>{k.icon}</div>
                <div>
                  <p style={{ color: "var(--muted)", fontSize: 12, fontWeight: 600, marginBottom: 4 }}>{k.label}</p>
                  <p style={{ fontSize: 28, fontWeight: 800, fontFamily: "var(--font-head)", color: k.color, lineHeight: 1 }}>{k.value}</p>
                  <p style={{ color: "var(--muted)", fontSize: 11, marginTop: 4 }}>{k.sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Volume breakdown */}
          <div style={styles.twoCol}>
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>Transaction Volume</h3>
              {[
                { type: "Deposits", total: stats.depositTotal, color: "var(--green)", pct: stats.depositTotal / (stats.depositTotal + stats.withdrawTotal + stats.transferTotal + 1) },
                { type: "Withdrawals", total: stats.withdrawTotal, color: "var(--red)", pct: stats.withdrawTotal / (stats.depositTotal + stats.withdrawTotal + stats.transferTotal + 1) },
                { type: "Transfers", total: stats.transferTotal, color: "var(--accent2)", pct: stats.transferTotal / (stats.depositTotal + stats.withdrawTotal + stats.transferTotal + 1) },
              ].map((item) => (
                <div key={item.type} style={{ marginBottom: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{item.type}</span>
                    <span style={{ color: item.color, fontWeight: 700, fontFamily: "var(--font-head)", fontSize: 14 }}>{fmt(item.total)}</span>
                  </div>
                  <div style={styles.progressBg}>
                    <div style={{ ...styles.progressBar, width: `${Math.min(item.pct * 100, 100)}%`, background: item.color }}></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Recent transactions mini */}
            <div style={styles.card}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h3 style={styles.cardTitle}>Recent Activity</h3>
                <button onClick={() => setTab("transactions")} style={styles.seeAllBtn}>See all →</button>
              </div>
              {txns.slice(0, 6).map((t) => (
                <div key={t._id} style={styles.miniTxn}>
                  <div style={{ ...styles.miniIcon, background: typeColors[t.type] + "18", color: typeColors[t.type] }}>
                    {typeIcons[t.type]}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13, fontWeight: 600 }}>{t.transactionId}</p>
                    <p style={{ fontSize: 11, color: "var(--muted)" }}>{new Date(t.createdAt).toLocaleDateString("en-IN")}</p>
                  </div>
                  <span style={{ fontWeight: 700, color: typeColors[t.type], fontFamily: "var(--font-head)", fontSize: 13 }}>{fmt(t.amount)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── USERS TAB ── */}
      {!loading && tab === "users" && (
        <div style={styles.tableCard}>
          <div style={styles.tableHead5}>
            <span>Customer</span>
            <span>Account ID</span>
            <span>Balance</span>
            <span>Status</span>
            <span>Actions</span>
          </div>
          {users.length === 0 ? (
            <p style={{ padding: 24, color: "var(--muted)" }}>No customers found.</p>
          ) : users.map((u) => (
            <div key={u._id} style={styles.tableRow5}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ ...styles.smallAvatar }}>{u.name[0].toUpperCase()}</div>
                <div>
                  <p style={{ fontWeight: 600, fontSize: 14 }}>{u.name}</p>
                  <p style={{ color: "var(--muted)", fontSize: 12 }}>{u.email}</p>
                </div>
              </div>
              <div style={{ fontFamily: "monospace", fontSize: 12, color: "var(--muted)" }}>
                {u.account?.accountId || "—"}
              </div>
              <div style={{ fontWeight: 700, color: "var(--green)", fontFamily: "var(--font-head)" }}>
                {u.account ? fmt(u.account.balance) : "—"}
              </div>
              <div>
                {u.account ? <span className={`badge badge-${u.account.status}`}>{u.account.status}</span> : "—"}
              </div>
              <div>
                {u.account && u.account.status !== "pending" ? (
                  <button
                    onClick={() => toggleFreeze(u.account.accountId, u.account.status)}
                    className={u.account.status === "frozen" ? "btn-success btn-sm" : "btn-danger btn-sm"}>
                    {u.account.status === "frozen" ? "Unfreeze" : "Freeze"}
                  </button>
                ) : <span style={{ color: "var(--muted)", fontSize: 13 }}>—</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── TRANSACTIONS TAB ── */}
      {!loading && tab === "transactions" && (
        <div style={styles.tableCard}>
          <div style={{ ...styles.tableHead5, gridTemplateColumns: "1.8fr 1fr 1fr 1fr 1fr" }}>
            <span>Transaction ID</span>
            <span>Type</span>
            <span>Amount</span>
            <span>Status</span>
            <span>Date</span>
          </div>
          {txns.length === 0 ? (
            <p style={{ padding: 24, color: "var(--muted)" }}>No transactions yet.</p>
          ) : txns.map((t) => (
            <div key={t._id} style={{ ...styles.tableRow5, gridTemplateColumns: "1.8fr 1fr 1fr 1fr 1fr" }}>
              <div style={{ fontFamily: "monospace", fontSize: 12, color: "var(--muted)" }}>{t.transactionId}</div>
              <div>
                <span style={{
                  padding: "3px 10px", borderRadius: 6, fontSize: 12, fontWeight: 600,
                  background: typeColors[t.type] + "18", color: typeColors[t.type],
                  fontFamily: "var(--font-head)",
                }}>
                  {typeIcons[t.type]} {t.type}
                </span>
              </div>
              <div style={{ fontWeight: 700, fontFamily: "var(--font-head)" }}>{fmt(t.amount)}</div>
              <div><span className="badge badge-active">{t.status}</span></div>
              <div style={{ color: "var(--muted)", fontSize: 13 }}>
                {new Date(t.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 },
  title: { fontSize: 28, fontWeight: 800, marginBottom: 4 },
  refreshBtn: {
    background: "var(--card)", border: "1.5px solid var(--border)", color: "var(--muted)",
    borderRadius: 10, padding: "9px 16px", fontFamily: "var(--font-head)", fontWeight: 600,
    fontSize: 13, cursor: "pointer",
  },
  toast: {
    position: "fixed", top: 20, right: 20, zIndex: 999,
    background: "rgba(34,211,160,0.15)", border: "1.5px solid rgba(34,211,160,0.4)",
    color: "var(--green)", borderRadius: 12, padding: "12px 20px",
    fontFamily: "var(--font-head)", fontWeight: 600, fontSize: 14,
    boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
  },
  tabs: { display: "flex", gap: 10, marginBottom: 24 },
  tab: {
    background: "var(--card)", border: "1.5px solid var(--border)", color: "var(--muted)",
    borderRadius: 10, padding: "10px 20px", fontFamily: "var(--font-head)", fontWeight: 600,
    fontSize: 14, cursor: "pointer", transition: "all 0.2s",
  },
  tabActive: { background: "rgba(108,99,255,0.15)", borderColor: "rgba(108,99,255,0.4)", color: "var(--accent2)" },
  kpiGrid: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 20 },
  kpiCard: {
    background: "var(--card)", border: "1.5px solid var(--border)", borderRadius: 16,
    padding: "20px", display: "flex", alignItems: "flex-start", gap: 14,
  },
  kpiIcon: {
    width: 44, height: 44, borderRadius: 12, fontSize: 18,
    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
  },
  twoCol: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
  card: {
    background: "var(--card)", border: "1.5px solid var(--border)",
    borderRadius: 16, padding: "22px",
  },
  cardTitle: { fontSize: 15, fontWeight: 700, marginBottom: 16, fontFamily: "var(--font-head)" },
  progressBg: { height: 6, background: "var(--card2)", borderRadius: 3, overflow: "hidden" },
  progressBar: { height: "100%", borderRadius: 3, transition: "width 0.5s" },
  miniTxn: {
    display: "flex", alignItems: "center", gap: 10,
    padding: "9px 0", borderBottom: "1px solid var(--border)",
  },
  miniIcon: {
    width: 32, height: 32, borderRadius: 8, display: "flex",
    alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0,
  },
  seeAllBtn: {
    background: "none", border: "none", color: "var(--accent2)",
    fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-head)",
  },
  tableCard: {
    background: "var(--card)", border: "1.5px solid var(--border)", borderRadius: 14, overflow: "hidden",
  },
  tableHead5: {
    display: "grid", gridTemplateColumns: "2fr 1.5fr 1fr 1fr 1.5fr",
    padding: "14px 20px", background: "var(--card2)",
    color: "var(--muted)", fontSize: 12, fontWeight: 600,
    fontFamily: "var(--font-head)", borderBottom: "1.5px solid var(--border)",
  },
  tableRow5: {
    display: "grid", gridTemplateColumns: "2fr 1.5fr 1fr 1fr 1.5fr",
    padding: "15px 20px", alignItems: "center", borderBottom: "1px solid var(--border)",
  },
  smallAvatar: {
    width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
    background: "linear-gradient(135deg, var(--accent), var(--accent2))",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontWeight: 700, fontSize: 13, color: "#fff",
  },
};
