import React, { useState, useRef } from "react";
import API from "../utils/api";

const TABS = ["deposit", "withdraw", "transfer"];

export default function Transfer() {
  const [tab, setTab] = useState("deposit");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);

  // Transfer search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [searching, setSearching] = useState(false);
  const searchTimeout = useRef(null);

  const reset = () => {
    setAmount(""); setDescription("");
    setSearchQuery(""); setSearchResults([]); setSelectedAccount(null);
  };

  const handleSearch = (val) => {
    setSearchQuery(val);
    setSelectedAccount(null);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (val.trim().length < 2) { setSearchResults([]); return; }
    searchTimeout.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await API.get(`/account/search?name=${encodeURIComponent(val)}`);
        setSearchResults(res.data);
      } catch { setSearchResults([]); }
      finally { setSearching(false); }
    }, 400);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg({ type: "", text: "" }); setLoading(true);
    try {
      let res;
      if (tab === "deposit") res = await API.post("/transactions/deposit", { amount: Number(amount) });
      else if (tab === "withdraw") res = await API.post("/transactions/withdraw", { amount: Number(amount) });
      else {
        if (!selectedAccount) {
          setMsg({ type: "error", text: "Please search and select a recipient account" });
          setLoading(false); return;
        }
        res = await API.post("/transactions/transfer", {
          toAccountId: selectedAccount.accountId,
          amount: Number(amount),
          description,
        });
      }
      setMsg({
        type: "success",
        text: `${res.data.message} · New Balance: ₹${Number(res.data.balance).toLocaleString("en-IN")}`,
      });
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
      <p style={{ color: "var(--muted)", marginBottom: 28, fontSize: 14 }}>Deposit, withdraw or send money securely</p>

      {/* Tab selector */}
      <div style={styles.tabs}>
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); setMsg({ type: "", text: "" }); reset(); }}
            style={{ ...styles.tab, ...(tab === t ? { ...styles.tabActive, borderColor: colors[t], color: colors[t] } : {}) }}
          >
            <span style={{ fontSize: 18 }}>{icons[t]}</span>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Form card */}
      <div style={styles.card}>
        <div style={{ ...styles.cardAccent, background: colors[tab] }}></div>
        <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>
          {tab.charAt(0).toUpperCase() + tab.slice(1)} Funds
        </h3>

        <form onSubmit={handleSubmit} style={styles.form}>

          {/* Transfer — name search */}
          {tab === "transfer" && (
            <div style={{ ...styles.field, zIndex: 10 }}>
              <label style={styles.label}>Search Recipient by Name</label>
              <div style={{ position: "relative" }}>
                <input
                  placeholder="Type recipient's name..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  autoComplete="off"
                />
                {searching && (
                  <span style={styles.searchSpinner}>⟳</span>
                )}
              </div>

              {/* Dropdown results */}
              {searchResults.length > 0 && !selectedAccount && (
                <div style={styles.dropdown}>
                  {searchResults.map((acc) => (
                    <div
                      key={acc.accountId}
                      style={styles.dropdownItem}
                      onMouseDown={() => {
                        setSelectedAccount(acc);
                        setSearchQuery(acc.userName);
                        setSearchResults([]);
                      }}
                    >
                      <div style={styles.dropAvatar}>{acc.userName[0].toUpperCase()}</div>
                      <div>
                        <p style={{ fontWeight: 600, fontSize: 14 }}>{acc.userName}</p>
                        <p style={{ color: "var(--muted)", fontSize: 12 }}>{acc.accountId} · {acc.accountType}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {searchQuery.length >= 2 && searchResults.length === 0 && !searching && !selectedAccount && (
                <p style={{ color: "var(--muted)", fontSize: 12, marginTop: 6 }}>
                  No accounts found for "{searchQuery}"
                </p>
              )}

              {/* Selected account chip */}
              {selectedAccount && (
                <div style={styles.selectedPill}>
                  <div style={styles.dropAvatar}>{selectedAccount.userName[0].toUpperCase()}</div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 600, fontSize: 14 }}>{selectedAccount.userName}</p>
                    <p style={{ color: "var(--muted)", fontSize: 12 }}>{selectedAccount.accountId} · {selectedAccount.accountType}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setSelectedAccount(null); setSearchQuery(""); }}
                    style={{ background: "none", border: "none", color: "var(--muted)", fontSize: 18, cursor: "pointer", lineHeight: 1 }}
                  >✕</button>
                </div>
              )}
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
                placeholder="e.g. Rent, Lunch split..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          )}

          {msg.text && (
            <div style={{
              padding: "12px 14px", borderRadius: 10, fontSize: 13,
              background: msg.type === "success" ? "rgba(34,211,160,0.1)" : "rgba(255,107,107,0.1)",
              color: msg.type === "success" ? "var(--green)" : "var(--red)",
              border: `1px solid ${msg.type === "success" ? "rgba(34,211,160,0.3)" : "rgba(255,107,107,0.3)"}`,
            }}>
              {msg.text}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{ ...styles.submitBtn, background: colors[tab], boxShadow: `0 4px 24px ${colors[tab]}33` }}
          >
            {loading ? "Processing..." : `Confirm ${tab.charAt(0).toUpperCase() + tab.slice(1)}`}
          </button>
        </form>
      </div>

      <div style={styles.tip}>
        <p style={{ color: "var(--muted)", fontSize: 13 }}>
          {tab === "deposit" && "💡 Funds will be credited to your account immediately."}
          {tab === "withdraw" && "💡 Ensure sufficient balance before withdrawing."}
          {tab === "transfer" && "💡 Search by the recipient's name and select from results to send money."}
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: { maxWidth: 560 },
  title: { fontSize: 28, fontWeight: 800, marginBottom: 4 },
  tabs: { display: "flex", gap: 10, marginBottom: 24 },
  tab: {
    flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
    background: "var(--card)", border: "1.5px solid var(--border)", color: "var(--muted)",
    borderRadius: 12, padding: "12px", fontFamily: "var(--font-head)", fontWeight: 600,
    fontSize: 14, cursor: "pointer", transition: "all 0.2s",
  },
  tabActive: { background: "var(--card2)" },
  card: {
    background: "var(--card)", border: "1.5px solid var(--border)", borderRadius: 18,
    padding: "28px", position: "relative", overflow: "visible", marginBottom: 16,
  },
  cardAccent: { position: "absolute", top: 0, left: 0, right: 0, height: 3, opacity: 0.7, borderRadius: "18px 18px 0 0" },
  form: { display: "flex", flexDirection: "column", gap: 16 },
  field: { display: "flex", flexDirection: "column", gap: 6, position: "relative" },
  label: { fontSize: 13, fontWeight: 600, color: "var(--muted)", fontFamily: "var(--font-head)" },
  searchSpinner: {
    position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
    color: "var(--muted)", fontSize: 16,
  },
  dropdown: {
    position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0,
    background: "var(--card2)", border: "1.5px solid var(--border)",
    borderRadius: 12, zIndex: 50, overflow: "hidden",
    boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
  },
  dropdownItem: {
    display: "flex", alignItems: "center", gap: 12, padding: "12px 14px",
    cursor: "pointer", transition: "background 0.15s", borderBottom: "1px solid var(--border)",
  },
  dropAvatar: {
    width: 34, height: 34, borderRadius: "50%",
    background: "linear-gradient(135deg, var(--accent), var(--accent2))",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontWeight: 700, fontSize: 13, flexShrink: 0, color: "#fff",
  },
  selectedPill: {
    display: "flex", alignItems: "center", gap: 10,
    background: "rgba(108,99,255,0.1)", border: "1.5px solid rgba(108,99,255,0.3)",
    borderRadius: 10, padding: "10px 12px", marginTop: 4,
  },
  submitBtn: {
    color: "#fff", border: "none", borderRadius: 12, padding: "14px", fontSize: 16,
    fontWeight: 700, fontFamily: "var(--font-head)", cursor: "pointer",
    transition: "opacity 0.2s, transform 0.15s", marginTop: 4,
  },
  tip: {
    background: "var(--card2)", border: "1.5px solid var(--border)", borderRadius: 12, padding: "14px 16px",
  },
};
