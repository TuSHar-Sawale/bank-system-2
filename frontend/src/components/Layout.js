import React, { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const customerNav = [
  { to: "/dashboard", label: "Dashboard", icon: "⬡" },
  { to: "/transfer", label: "Transfer", icon: "⇄" },
  { to: "/transactions", label: "History", icon: "≡" },
];

const adminNav = [
  { to: "/admin", label: "Admin Panel", icon: "◈" },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showLogout, setShowLogout] = useState(false);

  const handleLogout = () => { logout(); navigate("/login"); };

  const navItems = user?.role === "admin" ? adminNav : customerNav;

  return (
    <div style={styles.shell}>
      {/* Sidebar */}
      <aside style={{ ...styles.sidebar, transform: mobileOpen ? "translateX(0)" : undefined }}>
        <div style={styles.logo}>
          <span style={styles.logoDot}></span>
          <span style={styles.logoText}>NexBank</span>
        </div>

        <nav style={styles.nav}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              style={({ isActive }) => ({ ...styles.navItem, ...(isActive ? styles.navActive : {}) })}
              onClick={() => setMobileOpen(false)}
            >
              <span style={styles.navIcon}>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}

          {/* Profile — visible to all */}
          <NavLink
            to="/profile"
            style={({ isActive }) => ({ ...styles.navItem, ...(isActive ? styles.navActive : {}) })}
            onClick={() => setMobileOpen(false)}
          >
            <span style={styles.navIcon}>◎</span>
            Profile
          </NavLink>
        </nav>

        {/* User box + logout */}
        <div style={styles.userBox}>
          <div style={styles.avatar}>{user?.name?.[0]?.toUpperCase()}</div>
          <div style={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
            <div style={{ fontWeight: 600, fontSize: 14, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {user?.name}
            </div>
            <div style={{ color: "var(--muted)", fontSize: 11, textTransform: "capitalize" }}>{user?.role}</div>
          </div>
          <button
            onClick={() => setShowLogout(true)}
            style={styles.logoutBtn}
            title="Logout"
          >↩</button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && <div style={styles.overlay} onClick={() => setMobileOpen(false)} />}

      {/* Logout confirm modal */}
      {showLogout && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalIcon}>↩</div>
            <h3 style={{ fontWeight: 700, fontSize: 20, marginBottom: 8 }}>Sign Out</h3>
            <p style={{ color: "var(--muted)", fontSize: 14, marginBottom: 24 }}>
              Are you sure you want to log out of NexBank?
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setShowLogout(false)}
                className="btn-secondary"
                style={{ flex: 1 }}
              >Cancel</button>
              <button
                onClick={handleLogout}
                style={{ flex: 1, background: "var(--red)", color: "#fff", border: "none", borderRadius: 10, padding: "12px", fontFamily: "var(--font-head)", fontWeight: 700, cursor: "pointer" }}
              >Log Out</button>
            </div>
          </div>
        </div>
      )}

      {/* Main */}
      <main style={styles.main}>
        <div style={styles.mobileBar}>
          <button style={styles.menuBtn} onClick={() => setMobileOpen(!mobileOpen)}>☰</button>
          <span style={styles.logoText}>NexBank</span>
        </div>
        <div style={styles.content}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}

const styles = {
  shell: { display: "flex", minHeight: "100vh", background: "var(--bg)" },
  sidebar: {
    width: 230, background: "var(--bg2)", borderRight: "1.5px solid var(--border)",
    display: "flex", flexDirection: "column", padding: "28px 16px 20px",
    position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 100, transition: "transform 0.3s",
  },
  logo: { display: "flex", alignItems: "center", gap: 10, marginBottom: 36, paddingLeft: 8 },
  logoDot: {
    width: 28, height: 28, borderRadius: "50%",
    background: "linear-gradient(135deg, var(--accent), var(--accent2))", display: "block",
  },
  logoText: { fontFamily: "var(--font-head)", fontWeight: 800, fontSize: 20, letterSpacing: "-0.03em" },
  nav: { flex: 1, display: "flex", flexDirection: "column", gap: 4 },
  navItem: {
    display: "flex", alignItems: "center", gap: 12, padding: "11px 14px", borderRadius: 10,
    color: "var(--muted)", fontFamily: "var(--font-head)", fontWeight: 600, fontSize: 14,
    transition: "all 0.15s", borderLeft: "3px solid transparent",
  },
  navActive: { background: "rgba(108,99,255,0.15)", color: "var(--accent2)", borderLeft: "3px solid var(--accent)" },
  navIcon: { fontSize: 18, width: 20, textAlign: "center" },
  userBox: {
    display: "flex", alignItems: "center", gap: 10, background: "var(--card)",
    borderRadius: 10, padding: "12px", marginTop: 12, border: "1.5px solid var(--border)",
  },
  avatar: {
    width: 34, height: 34, borderRadius: "50%",
    background: "linear-gradient(135deg, var(--accent), var(--accent2))",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontWeight: 700, fontSize: 14, flexShrink: 0,
  },
  logoutBtn: {
    background: "none", border: "none", color: "var(--muted)",
    fontSize: 18, padding: "2px 4px", cursor: "pointer", flexShrink: 0,
  },
  main: { flex: 1, marginLeft: 230, minHeight: "100vh", display: "flex", flexDirection: "column" },
  mobileBar: { display: "none", padding: "16px 20px", borderBottom: "1.5px solid var(--border)", alignItems: "center", gap: 12 },
  menuBtn: { background: "none", border: "none", color: "var(--text)", fontSize: 22 },
  content: { padding: "36px 32px", flex: 1 },
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 99 },
  modalOverlay: {
    position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
    display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200,
  },
  modal: {
    background: "var(--card)", border: "1.5px solid var(--border)", borderRadius: 20,
    padding: "36px 32px", width: "100%", maxWidth: 360, textAlign: "center",
  },
  modalIcon: {
    width: 56, height: 56, borderRadius: "50%",
    background: "rgba(255,107,107,0.15)", color: "var(--red)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 24, margin: "0 auto 16px",
  },
};

