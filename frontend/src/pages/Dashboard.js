import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../utils/api";

export default function Dashboard() {
  const { user } = useAuth();
  const [account, setAccount] = useState(null);
  const [txns, setTxns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [accRes, txnRes] = await Promise.all([
          API.get("/account"),
          API.get("/transactions"),
        ]);
        setAccount(accRes.data);
        setTxns(txnRes.data.slice(0, 5));
      } catch (err) {
        console.error(err);
      } finally { setLoading(false); }
    };
    fetchData();
  }, []);

  if (loading) return <div style={{ color: "var(--muted)" }}>Loading...</div>;

  const fmt = (n) => "₹" + Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2 });

  return (
    <div>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.greeting}>Hello, {user.name.split(" ")[0]} 👋</h1>
          <p style={{ color: "var(--muted)", fontSize: 14 }}>Here's your financial overview</p>
        </div>
      </div>

      {/* Balance Card */}
      <div style={styles.balanceCard}>
        <div style={styles.balanceBg}></div>
        <div style={{ position: "relative" }}>
          <p style={styles.balanceLabel}>Total Balance</p>
          <h2 style={styles.balanceAmt}>
            {account ? fmt(account.balance) : "—"}
          </h2>
          <div style={styles.accountRow}>
            <span style={styles.accId}>
              {account?.accountId || "—"}
            </span>
            <span className={`badge badge-${account?.status}`}>{account?.status}</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={styles.actions}>
        {[
          { label: "Deposit", to: "/transfer", icon: "↓", color: "var(--green)" },
          { label: "Withdraw", to: "/transfer", icon: "↑", color: "var(--red)" },
          { label: "Transfer", to: "/transfer", icon: "⇄", color: "var(--accent2)" },
          { label: "History", to: "/transactions", icon: "≡", color: "var(--yellow)" },
        ].map((a) => (
          <Link to={a.to} key={a.label} style={{ ...styles.actionCard, borderColor: a.color + "33" }}>
            <span style={{ ...styles.actionIcon, background: a.color + "22", color: a.color }}>{a.icon}</span>
            <span style={styles.actionLabel}>{a.label}</span>
          </Link>
        ))}
      </div>

      {/* Recent Transactions */}
      <div style={styles.section}>
        <div style={styles.sectionHead}>
          <h3 style={styles.sectionTitle}>Recent Transactions</h3>
          <Link to="/transactions" style={styles.seeAll}>See all →</Link>
        </div>

        {txns.length === 0 ? (
          <div style={styles.empty}>No transactions yet.</div>
        ) : (
          <div style={styles.txnList}>
            {txns.map((t) => (
              <TxnRow key={t._id} t={t} accountId={account?._id} fmt={fmt} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TxnRow({ t, accountId, fmt }) {
  const isDebit = t.type === "withdrawal" || (t.type === "transfer" && t.senderId === accountId);
  const color = isDebit ? "var(--red)" : "var(--green)";
  const sign = isDebit ? "-" : "+";
  const icons = { deposit: "↓", withdrawal: "↑", transfer: "⇄" };

  return (
    <div style={styles.txnRow}>
      <div style={{ ...styles.txnIcon, color, background: color + "18" }}>
        {icons[t.type]}
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ fontWeight: 600, fontSize: 14 }}>{t.description || t.type}</p>
        <p style={{ color: "var(--muted)", fontSize: 12 }}>
          {new Date(t.createdAt).toLocaleDateString()} · {t.transactionId}
        </p>
      </div>
      <span style={{ color, fontWeight: 700, fontFamily: "var(--font-head)" }}>
        {sign}{fmt(t.amount)}
      </span>
    </div>
  );
}

const styles = {
  header: { marginBottom: 28, display: "flex", justifyContent: "space-between", alignItems: "flex-start" },
  greeting: { fontSize: 28, fontWeight: 800, marginBottom: 4 },
  balanceCard: {
    background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #1a1a2e 100%)",
    border: "1.5px solid rgba(108,99,255,0.3)",
    borderRadius: 20, padding: "32px 28px", marginBottom: 24,
    position: "relative", overflow: "hidden",
  },
  balanceBg: {
    position: "absolute", top: -40, right: -40,
    width: 200, height: 200, borderRadius: "50%",
    background: "radial-gradient(circle, rgba(108,99,255,0.2) 0%, transparent 70%)",
  },
  balanceLabel: { color: "var(--muted)", fontSize: 13, marginBottom: 8, fontWeight: 600 },
  balanceAmt: { fontSize: 40, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 16 },
  accountRow: { display: "flex", alignItems: "center", gap: 12 },
  accId: { fontSize: 13, color: "var(--muted)", fontFamily: "monospace", letterSpacing: 1 },
  actions: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 28 },
  actionCard: {
    background: "var(--card)", border: "1.5px solid var(--border)",
    borderRadius: 14, padding: "18px 12px",
    display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
    transition: "border-color 0.2s", cursor: "pointer",
  },
  actionIcon: {
    width: 42, height: 42, borderRadius: 12,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 18, fontWeight: 700,
  },
  actionLabel: { fontSize: 13, fontWeight: 600, fontFamily: "var(--font-head)" },
  section: { background: "var(--card)", border: "1.5px solid var(--border)", borderRadius: 16, padding: 24 },
  sectionHead: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 },
  sectionTitle: { fontSize: 17, fontWeight: 700 },
  seeAll: { color: "var(--accent2)", fontSize: 13, fontWeight: 600 },
  txnList: { display: "flex", flexDirection: "column", gap: 0 },
  txnRow: {
    display: "flex", alignItems: "center", gap: 14, padding: "14px 0",
    borderBottom: "1px solid var(--border)",
  },
  txnIcon: {
    width: 38, height: 38, borderRadius: 10,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 16, fontWeight: 700, flexShrink: 0,
  },
  empty: { color: "var(--muted)", fontSize: 14, textAlign: "center", padding: "24px 0" },
};
