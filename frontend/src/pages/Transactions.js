import React, { useEffect, useState } from "react";
import API from "../utils/api";

export default function Transactions() {
  const [txns, setTxns] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ type: "", startDate: "", endDate: "" });
  const [account, setAccount] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [txRes, accRes] = await Promise.all([API.get("/transactions"), API.get("/account")]);
        setTxns(txRes.data); setFiltered(txRes.data); setAccount(accRes.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const applyFilter = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter.type) params.append("type", filter.type);
      if (filter.startDate) params.append("startDate", filter.startDate);
      if (filter.endDate) params.append("endDate", filter.endDate);
      const res = await API.get(`/transactions?${params}`);
      setFiltered(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const clearFilter = async () => {
    setFilter({ type: "", startDate: "", endDate: "" });
    setFiltered(txns);
  };

  const fmt = (n) => "₹" + Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2 });

  const typeColors = { deposit: "var(--green)", withdrawal: "var(--red)", transfer: "var(--accent2)" };
  const typeIcons = { deposit: "↓", withdrawal: "↑", transfer: "⇄" };

  return (
    <div>
      <h1 style={styles.title}>Transaction History</h1>
      <p style={{ color: "var(--muted)", marginBottom: 24, fontSize: 14 }}>
        All your account activity in one place
      </p>

      {/* Filters */}
      <div style={styles.filterBox}>
        <div style={styles.filterRow}>
          <div style={styles.filterField}>
            <label style={styles.label}>Type</label>
            <select value={filter.type} onChange={(e) => setFilter({ ...filter, type: e.target.value })}>
              <option value="">All Types</option>
              <option value="deposit">Deposit</option>
              <option value="withdrawal">Withdrawal</option>
              <option value="transfer">Transfer</option>
            </select>
          </div>
          <div style={styles.filterField}>
            <label style={styles.label}>From</label>
            <input type="date" value={filter.startDate}
              onChange={(e) => setFilter({ ...filter, startDate: e.target.value })} />
          </div>
          <div style={styles.filterField}>
            <label style={styles.label}>To</label>
            <input type="date" value={filter.endDate}
              onChange={(e) => setFilter({ ...filter, endDate: e.target.value })} />
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
          <button onClick={applyFilter} className="btn-primary" style={{ width: "auto", padding: "10px 24px" }}>
            Apply Filter
          </button>
          <button onClick={clearFilter} className="btn-secondary btn-sm" style={{ padding: "10px 20px" }}>
            Clear
          </button>
        </div>
      </div>

      {/* Summary */}
      <div style={styles.summary}>
        {["deposit", "withdrawal", "transfer"].map((type) => {
          const total = filtered.filter((t) => t.type === type).reduce((s, t) => s + t.amount, 0);
          return (
            <div key={type} style={{ ...styles.summaryCard, borderColor: typeColors[type] + "44" }}>
              <span style={{ color: typeColors[type], fontSize: 18 }}>{typeIcons[type]}</span>
              <div>
                <p style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600, textTransform: "capitalize" }}>{type}s</p>
                <p style={{ fontWeight: 700, fontSize: 16, color: typeColors[type] }}>{fmt(total)}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Table */}
      <div style={styles.tableCard}>
        {loading ? (
          <p style={{ color: "var(--muted)", padding: 24 }}>Loading...</p>
        ) : filtered.length === 0 ? (
          <p style={{ color: "var(--muted)", textAlign: "center", padding: "32px 0" }}>No transactions found.</p>
        ) : (
          <>
            <div style={styles.tableHead}>
              <span>Transaction</span>
              <span>Date</span>
              <span>Type</span>
              <span style={{ textAlign: "right" }}>Amount</span>
            </div>
            {filtered.map((t) => {
              const isDebit = t.type === "withdrawal" || (t.type === "transfer" && String(t.senderId) === String(account?._id));
              return (
                <div key={t._id} style={styles.tableRow}>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: 14 }}>{t.description || t.type}</p>
                    <p style={{ color: "var(--muted)", fontSize: 11, marginTop: 2 }}>{t.transactionId}</p>
                  </div>
                  <div style={{ color: "var(--muted)", fontSize: 13 }}>
                    {new Date(t.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </div>
                  <div>
                    <span style={{
                      ...styles.typeBadge,
                      background: typeColors[t.type] + "18",
                      color: typeColors[t.type],
                    }}>
                      {typeIcons[t.type]} {t.type}
                    </span>
                  </div>
                  <div style={{
                    textAlign: "right", fontWeight: 700,
                    color: isDebit ? "var(--red)" : "var(--green)",
                    fontFamily: "var(--font-head)",
                  }}>
                    {isDebit ? "-" : "+"}{fmt(t.amount)}
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  title: { fontSize: 28, fontWeight: 800, marginBottom: 4 },
  filterBox: {
    background: "var(--card)", border: "1.5px solid var(--border)",
    borderRadius: 14, padding: "20px 20px", marginBottom: 20,
  },
  filterRow: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 },
  filterField: { display: "flex", flexDirection: "column", gap: 6 },
  label: { fontSize: 12, fontWeight: 600, color: "var(--muted)", fontFamily: "var(--font-head)" },
  summary: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 20 },
  summaryCard: {
    background: "var(--card)", border: "1.5px solid var(--border)",
    borderRadius: 12, padding: "16px", display: "flex", alignItems: "center", gap: 12,
  },
  tableCard: {
    background: "var(--card)", border: "1.5px solid var(--border)",
    borderRadius: 14, overflow: "hidden",
  },
  tableHead: {
    display: "grid", gridTemplateColumns: "2fr 1.2fr 1fr 1fr",
    padding: "14px 20px", background: "var(--card2)",
    color: "var(--muted)", fontSize: 12, fontWeight: 600,
    fontFamily: "var(--font-head)", borderBottom: "1.5px solid var(--border)",
  },
  tableRow: {
    display: "grid", gridTemplateColumns: "2fr 1.2fr 1fr 1fr",
    padding: "16px 20px", alignItems: "center",
    borderBottom: "1px solid var(--border)", transition: "background 0.15s",
  },
  typeBadge: {
    display: "inline-flex", alignItems: "center", gap: 4,
    padding: "4px 10px", borderRadius: 6,
    fontSize: 12, fontWeight: 600, fontFamily: "var(--font-head)",
  },
};
