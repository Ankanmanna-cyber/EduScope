import { Outlet, NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../services/authContext";

export default function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const menuItems = [
    { to: "/dashboard", icon: "🏠", label: "Dashboard" },
    { to: "/live", icon: "📡", label: "Live Monitoring" },
    { to: "/students", icon: "👥", label: "Students" },
    { to: "/analytics", icon: "📈", label: "Analytics" },
    { to: "/reports", icon: "📄", label: "Reports" },
    { to: "/alerts", icon: "🔔", label: "Alerts" },
    { to: "/sessions", icon: "🗓️", label: "Sessions" },
  ];

  return (
    <div style={styles.container}>
      <aside style={styles.sidebar}>
        <div>
          <div style={styles.brand}>
            <div style={styles.logoIcon}>🧠</div>

            <div>
              <h2 style={styles.logoText}>AI Classroom</h2>
              <p style={styles.logoSub}>Engagement Analyzer</p>
            </div>
          </div>

          <nav style={styles.nav}>
            {menuItems.map((item) => {
              const isActive = location.pathname === item.to;

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  style={{
                    ...styles.navLink,
                    ...(isActive ? styles.activeNav : {}),
                  }}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div>
          <div style={styles.aiCard}>
            <h4>AI Assistant</h4>
            <p style={styles.aiText}>
              How can I improve engagement in my classroom?
            </p>
            <button style={styles.aiBtn}>Ask AI</button>
          </div>

          <div style={styles.userSection}>
            <button onClick={logout} style={styles.logoutBtn}>
              Logout
            </button>
          </div>
        </div>
      </aside>

      <main style={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    minHeight: "100vh",
    background:
      "linear-gradient(180deg, #0b1020 0%, #0b1730 40%, #0a1224 100%)",
    color: "#fff",
    fontFamily: "Inter, Arial, sans-serif",
  },

  sidebar: {
    width: 260,
    background: "rgba(8,15,35,0.92)",
    borderRight: "1px solid rgba(255,255,255,0.06)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    padding: 18,
  },

  brand: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginBottom: 28,
  },

  logoIcon: {
    width: 46,
    height: 46,
    borderRadius: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
    fontSize: "1.4rem",
  },

  logoText: {
    margin: 0,
    fontSize: "1.1rem",
    fontWeight: 700,
  },

  logoSub: {
    margin: 0,
    color: "#94a3b8",
    fontSize: "0.8rem",
  },

  nav: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },

  navLink: {
    display: "flex",
    gap: 12,
    alignItems: "center",
    padding: "12px 14px",
    borderRadius: 12,
    color: "#cbd5e1",
    textDecoration: "none",
    fontSize: "0.95rem",
  },

  activeNav: {
    background: "rgba(99,102,241,0.18)",
    color: "#fff",
  },

  aiCard: {
    marginTop: 20,
    padding: 16,
    borderRadius: 16,
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.06)",
  },

  aiText: {
    color: "#94a3b8",
    fontSize: "0.85rem",
  },

  aiBtn: {
    width: "100%",
    padding: 10,
    borderRadius: 10,
    border: "none",
    background: "linear-gradient(90deg,#6366f1,#8b5cf6)",
    color: "#fff",
    cursor: "pointer",
  },

  userSection: {
    marginTop: 18,
    borderTop: "1px solid rgba(255,255,255,0.06)",
    paddingTop: 14,
  },

  logoutBtn: {
    width: "100%",
    padding: 10,
    borderRadius: 10,
    border: "none",
    background: "#ef4444",
    color: "#fff",
    cursor: "pointer",
  },

  main: {
    flex: 1,
    overflowY: "auto",
  },
};