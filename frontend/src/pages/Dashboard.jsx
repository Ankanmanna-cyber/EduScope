import { useEffect, useState, useCallback } from "react";
import { FaUserCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import CameraFeed from "../components/CameraFeed";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import axios from "axios";

export default function Dashboard() {
  const navigate = useNavigate();
  const user =
  JSON.parse(localStorage.getItem("user")) || {
    name: "User",
  };

  // ─────────────────────────────────────────────
  // SESSION STATE
  // ─────────────────────────────────────────────
 const [sessionId, setSessionId] = useState(
  localStorage.getItem("activeSessionId") ||
    localStorage.getItem("lastSessionId") ||
    null
);

  const [results, setResults] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [currentData, setCurrentData] = useState(null);

  // ─────────────────────────────────────────────
  // DISTRIBUTION STATE
  // ─────────────────────────────────────────────
  const [distribution, setDistribution] = useState({
    high: 0,
    moderate: 0,
    low: 0,
    distracted: 0,
  });

  // ─────────────────────────────────────────────
  // LOAD PREVIOUS SESSION REPORT
  // ─────────────────────────────────────────────
  useEffect(() => {
    const loadSessionReport = async () => {
      const savedSessionId =
  localStorage.getItem("activeSessionId") ||
  localStorage.getItem("lastSessionId");

      if (!savedSessionId) return;

      try {
        const token = localStorage.getItem("token");

        const { data } = await axios.get(
          `http://localhost:5000/api/session/${savedSessionId}/report`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setSessionId(savedSessionId);

        setCurrentData({
          attention: data.avg_engagement || 0,
          emotion: "Session Complete",
          engagement: {
            score: data.avg_engagement || 0,
            label: "Session Complete",
          },
          face_detected: true,
        });

        setDistribution({
          high: data.total_students || 0,
          moderate: 0,
          low: 0,
          distracted: 0,
        });

        setResults([
          {
            time: "Final",
            score: data.avg_engagement || 0,
          },
        ]);
      } catch (err) {
        console.error(
          "Failed to load session report:",
          err.response?.data || err.message
        );
      }
    };

    loadSessionReport();
  }, []);

  // ─────────────────────────────────────────────
  // START NEW SESSION
  // ─────────────────────────────────────────────
  const startSession = async () => {
    try {
      const token = localStorage.getItem("token");

      const { data } = await axios.post(
        "http://localhost:5000/api/session/start",
        { class_name: "Class A" },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!data.session_id) {
        alert("Session creation failed");
        return;
      }

      // Reset old data
      setResults([]);
      setAlerts([]);
      setCurrentData(null);

      setDistribution({
        high: 0,
        moderate: 0,
        low: 0,
        distracted: 0,
      });

      localStorage.setItem("activeSessionId", data.session_id);

      setSessionId(data.session_id);

      navigate("/live");
    } catch (err) {
      console.error(
        "Failed to start session:",
        err.response?.data || err.message
      );

      alert(
        err.response?.data?.error ||
          "Failed to start session"
      );
    }
  };

  // ─────────────────────────────────────────────
  // LIVE AI RESULT HANDLER
  // ─────────────────────────────────────────────
  const handleResult = useCallback((result, alert) => {
    if (!result) return;

    setCurrentData(result);

    const score = result.engagement?.score || 0;

    // Trend Graph
    setResults((prev) => [
      ...prev.slice(-30),
      {
        time: new Date().toLocaleTimeString(),
        score,
      },
    ]);

    // Distribution
    setDistribution((prev) => {
      const updated = { ...prev };

      if (!result.face_detected) {
        updated.distracted += 1;
      } else if (score >= 80) {
        updated.high += 1;
      } else if (score >= 60) {
        updated.moderate += 1;
      } else if (score >= 40) {
        updated.low += 1;
      } else {
        updated.distracted += 1;
      }

      return updated;
    });

    // Alerts
    if (alert) {
      setAlerts((prev) => [
        alert,
        ...prev.slice(0, 4),
      ]);
    }
  }, []);

  // ─────────────────────────────────────────────
  // PIE DATA
  // ─────────────────────────────────────────────
  const pieData = [
    {
      name: "Highly Engaged",
      value: distribution.high,
      color: "#22c55e",
    },
    {
      name: "Engaged",
      value: distribution.moderate,
      color: "#3b82f6",
    },
    {
      name: "Low Engagement",
      value: distribution.low,
      color: "#facc15",
    },
    {
      name: "Distracted",
      value: distribution.distracted,
      color: "#ef4444",
    },
  ];

  const totalStudents =
    distribution.high +
    distribution.moderate +
    distribution.low +
    distribution.distracted;

  const averageEngagement = results.length
    ? Math.round(
        results.reduce(
          (sum, item) => sum + item.score,
          0
        ) / results.length
      )
    : 0;

  return (
    <div style={styles.page}>
      {/* HEADER */}
      <div style={styles.topBar}>
        <div>
          <h1 style={styles.title}>Dashboard</h1>

          <p style={styles.subtitle}>
            Real-time overview of classroom
            engagement and insights
          </p>
        </div>

        {/* USER PROFILE */}
        <div style={styles.userBox}>
          <FaUserCircle size={38} color="#8b5cf6" />

          <span style={styles.userName}>
            {user.name || user.username || "User"}
          </span>
        </div>
      </div>

      {/* ACTIONS */}
      <div style={styles.headerActions}>
        <input
          placeholder="Search..."
          style={styles.search}
        />

        <button style={styles.iconBtn}>
          🔔
        </button>

        <button style={styles.dateBtn}>
          {new Date().toLocaleDateString()}
        </button>

        <button style={styles.exportBtn}>
          Export Report
        </button>

        <button
          onClick={startSession}
          style={styles.startBtn}
        >
          ▶️ Start Session
        </button>
      </div>

      {/* KPI GRID */}
      <div style={styles.kpiGrid}>
        <StatCard
          title="Average Engagement"
          value={`${averageEngagement}%`}
          sub="Live AI analysis"
        />

        <StatCard
          title="Active Students"
          value={`${totalStudents}`}
          sub="Detected by AI"
        />

        <StatCard
          title="Attention Level"
          value={
            currentData
              ? `${currentData.attention}%`
              : "--"
          }
          sub={
            currentData?.emotion || "Waiting"
          }
        />

        <StatCard
          title="Distractions"
          value={`${distribution.distracted}`}
          sub="Low attention"
        />

        <StatCard
          title="Session Duration"
          value={
            sessionId ? "Live" : "Not Started"
          }
          sub="● Session Status"
        />
      </div>

      {/* HIDDEN CAMERA ENGINE */}
      

      {/* ANALYTICS */}
      <div style={styles.analyticsGrid}>
        {/* TREND */}
        <div style={styles.largeCard}>
          <h3>Engagement Over Time</h3>

          {results.length === 0 ? (
            <p style={styles.emptyText}>
              Start session to begin live
              engagement tracking
            </p>
          ) : (
            <ResponsiveContainer
              width="100%"
              height={260}
            >
              <LineChart data={results}>
                <CartesianGrid stroke="#1e293b" />

                <XAxis
                  dataKey="time"
                  stroke="#94a3b8"
                />

                <YAxis
                  domain={[0, 100]}
                  stroke="#94a3b8"
                />

                <Tooltip />

                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* DISTRIBUTION */}
        <div style={styles.card}>
          <h3>Engagement Distribution</h3>

          {totalStudents === 0 ? (
            <p style={styles.emptyText}>
              Waiting for AI student
              detection...
            </p>
          ) : (
            <ResponsiveContainer
              width="100%"
              height={260}
            >
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  dataKey="value"
                  label
                >
                  {pieData.map(
                    (entry, i) => (
                      <Cell
                        key={i}
                        fill={entry.color}
                      />
                    )
                  )}
                </Pie>

                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* STUDENT TABLE */}
      <div style={styles.analyticsGridSingle}>
        <div style={styles.largeCard}>
          <h3>
            Real-time Student Engagement
          </h3>

          <table style={styles.table}>
            <thead>
              <tr>
                <th>Student</th>
                <th>Engagement</th>
                <th>Attention</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td>student_001</td>

                <td>
                  {currentData
                    ? `${currentData.engagement?.score || 0}%`
                    : "--"}
                </td>

                <td>
                  {currentData
                  ? `${currentData.attention}%`
                  : "--"}
                </td>

                <td>
                  {currentData
                    ? currentData.engagement
                        ?.label ||
                      "Waiting"
                    : "Waiting"}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// KPI CARD COMPONENT
// ─────────────────────────────────────────────
function StatCard({
  title,
  value,
  sub,
}) {
  return (
    <div style={styles.statCard}>
      <p style={styles.statTitle}>
        {title}
      </p>

      <h2 style={styles.statValue}>
        {value}
      </h2>

      <p style={styles.statSub}>{sub}</p>
    </div>
  );
}

// ─────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────
const styles = {
  page: {
    padding: 28,
    color: "#fff",
  },

  header: {
    display: "flex",
    justifyContent:
      "space-between",
    alignItems: "center",
    marginBottom: 24,
    flexWrap: "wrap",
  },
  topBar: {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 20,
  flexWrap: "wrap",
},

userBox: {
  display: "flex",
  alignItems: "center",
  gap: 12,
  background: "rgba(255,255,255,0.05)",
  padding: "10px 18px",
  borderRadius: 16,
},

userName: {
  fontSize: "1rem",
  fontWeight: 600,
},

  title: {
    fontSize: "2.2rem",
    fontWeight: 800,
    margin: 0,
  },

  subtitle: {
    color: "#94a3b8",
  },

  headerActions: {
  display: "flex",
  gap: 10,
  flexWrap: "wrap",
  marginBottom: 24,
},

  search: {
    padding: "12px",
    borderRadius: 12,
    border: "none",
    background:
      "rgba(255,255,255,0.06)",
    color: "#fff",
  },

  iconBtn: {
    padding: "12px",
    borderRadius: 12,
    border: "none",
    background:
      "rgba(255,255,255,0.06)",
    color: "#fff",
  },

  dateBtn: {
    padding: "12px",
    borderRadius: 12,
    border: "none",
    background:
      "rgba(255,255,255,0.06)",
    color: "#fff",
  },

  exportBtn: {
    padding: "12px",
    borderRadius: 12,
    border: "none",
    background:
      "linear-gradient(90deg,#6366f1,#8b5cf6)",
    color: "#fff",
    cursor: "pointer",
  },

  startBtn: {
    padding: "12px",
    borderRadius: 12,
    border: "none",
    background: "#22c55e",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 700,
  },

  kpiGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 16,
    marginBottom: 24,
  },

  statCard: {
    background:
      "rgba(255,255,255,0.05)",
    padding: 18,
    borderRadius: 18,
  },

  statTitle: {
    color: "#94a3b8",
    marginBottom: 12,
  },

  statValue: {
    margin: 0,
    fontSize: "2rem",
  },

  statSub: {
    color: "#94a3b8",
    fontSize: "0.8rem",
    marginTop: 10,
  },

  analyticsGrid: {
    display: "grid",
    gridTemplateColumns:
      "minmax(0,2fr) minmax(0,1fr)",
    gap: 20,
    marginBottom: 24,
  },

  analyticsGridSingle: {
    display: "grid",
    gridTemplateColumns:
      "1fr",
  },

  card: {
    background:
      "rgba(255,255,255,0.05)",
    padding: 20,
    borderRadius: 20,
    minHeight: 360,
  },

  largeCard: {
    background:
      "rgba(255,255,255,0.05)",
    padding: 20,
    borderRadius: 20,
    minHeight: 360,
  },

  emptyText: {
    color: "#94a3b8",
    marginTop: 60,
    textAlign: "center",
    fontSize: "1rem",
  },

  table: {
    width: "100%",
    borderCollapse:
      "collapse",
    marginTop: 12,
    color: "#fff",
  },
};