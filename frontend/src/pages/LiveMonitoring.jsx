import {
  useState,
  useCallback,
  useRef,
  useEffect,
} from "react";

import { useNavigate } from "react-router-dom";
import axios from "axios";

import CameraFeed from "../components/CameraFeed";
import EngagementGauge from "../components/EngagementGauge";

export default function LiveMonitoring() {
  const navigate = useNavigate();

  // CAMERA REF
  const cameraRef = useRef(null);

  // SESSION STATE
  const [sessionId, setSessionId] =
    useState(
      localStorage.getItem(
        "activeSessionId"
      )
    );

  // LIVE DATA
  const [currentData, setCurrentData] =
    useState(null);

  const [alerts, setAlerts] =
    useState([]);

  // VALIDATE SESSION
  useEffect(() => {
    const active =
      localStorage.getItem(
        "activeSessionId"
      );

    if (!active) {
      navigate("/dashboard");
      return;
    }

    setSessionId(active);

    // CLEANUP CAMERA
    return () => {
      cameraRef.current?.stopCamera?.();
    };
  }, [navigate]);

  // HANDLE AI RESULT
  const handleResult =
    useCallback(
      (result, alertData) => {
        if (!result) return;

        // SAFE RESULT OBJECT
        const safeResult = {
          attention:
            result.attention || 0,

          emotion:
            result.emotion ||
            "Unknown",

          face_detected:
            result.face_detected || false,

          engagement: {
            score:
              result.engagement
                ?.score || 0,

            label:
              result.engagement
                ?.label ||
              "Unknown",
          },
        };

        setCurrentData(
          safeResult
        );

        // LIMIT ALERT HISTORY
        if (alertData) {
          setAlerts(
            (prev) => [
              {
                student_id:
                  alertData.student_id ||
                  "Unknown",

                score:
                  alertData.score || 0,
              },

              ...prev.slice(0, 4),
            ]
          );
        }
      },
      []
    );

  // STOP SESSION
  const stopMonitoring =
    async () => {
      const activeSessionId =
        localStorage.getItem(
          "activeSessionId"
        );

      // STOP CAMERA FIRST
      cameraRef.current?.stopCamera?.();

      if (!activeSessionId) {
        navigate("/dashboard");
        return;
      }

      try {
        const token =
          localStorage.getItem(
            "token"
          );

        if (!token) {
          throw new Error(
            "No auth token found"
          );
        }

        await axios.patch(
          `http://localhost:5000/api/session/${activeSessionId}/end`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },

            timeout: 10000,
          }
        );

        console.log(
          "Session ended"
        );
      } catch (err) {
        console.error(
          "Failed to stop session:",
          err.response?.data ||
            err.message
        );
      }

      // SAVE LAST SESSION
      localStorage.setItem(
        "lastSessionId",
        activeSessionId
      );

      // REMOVE ACTIVE SESSION
      localStorage.removeItem(
        "activeSessionId"
      );

      // RESET UI
      setCurrentData(null);
      setAlerts([]);
      setSessionId(null);

      navigate("/dashboard");
    };

  return (
    <div style={styles.page}>
      {/* HEADER */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>
            📡 Live Monitoring
          </h1>

          <p style={styles.subtitle}>
            Real-time classroom AI
            tracking
          </p>
        </div>

        {sessionId && (
          <button
            onClick={
              stopMonitoring
            }
            style={
              styles.stopBtn
            }
          >
            ⏹ Stop Monitoring
          </button>
        )}
      </div>

      {/* NO SESSION */}
      {!sessionId ? (
        <div style={styles.card}>
          <p>
            No active session
            found.
          </p>

          <p>
            Start a session from
            Dashboard.
          </p>
        </div>
      ) : (
        <div style={styles.mainGrid}>
          {/* LEFT */}
          <div
            style={
              styles.leftColumn
            }
          >
            {/* CAMERA */}
            <div
              style={
                styles.card
              }
            >
              <h2
                style={
                  styles.sectionTitle
                }
              >
                🎥 Live Camera
              </h2>

              <div
                style={
                  styles.cameraWrapper
                }
              >
                <CameraFeed
                  ref={cameraRef}
                  sessionId={
                    sessionId
                  }
                  studentId="student_001"
                  onResult={
                    handleResult
                  }
                />
              </div>
            </div>

            {/* ALERTS */}
            <div
              style={
                styles.card
              }
            >
              <h2
                style={
                  styles.sectionTitle
                }
              >
                ⚠️ Live Alerts
              </h2>

              {alerts.length ===
              0 ? (
                <p
                  style={{
                    color:
                      "#94a3b8",
                  }}
                >
                  No alerts
                  detected
                </p>
              ) : (
                alerts.map(
                  (
                    alert,
                    index
                  ) => (
                    <div
                      key={index}
                      style={
                        styles.alert
                      }
                    >
                      🚨 Low
                      engagement for{" "}
                      <strong>
                        {
                          alert.student_id
                        }
                      </strong>

                      {" "}— Score:{" "}
                      {
                        alert.score
                      }
                    </div>
                  )
                )
              )}
            </div>
          </div>

          {/* RIGHT */}
          <div
            style={
              styles.rightColumn
            }
          >
            {/* GAUGE */}
            <div
              style={
                styles.card
              }
            >
              <h2
                style={
                  styles.sectionTitle
                }
              >
                📊 Engagement
              </h2>

              <EngagementGauge
                score={
                  currentData
                    ?.engagement
                    ?.score || 0
                }
                label={
                  currentData
                    ?.engagement
                    ?.label ||
                  "Waiting"
                }
              />
            </div>

            {/* INSIGHTS */}
            <div
              style={
                styles.card
              }
            >
              <h2
                style={
                  styles.sectionTitle
                }
              >
                🧠 Student
                Insights
              </h2>

              <div
                style={
                  styles.statItem
                }
              >
                😊 Emotion:
                <strong>
                  {" "}
                  {currentData?.emotion ||
                    "--"}
                </strong>
              </div>

              <div
                style={
                  styles.statItem
                }
              >
                👁 Attention:
                <strong>
                  {" "}
                  {currentData?.attention ||
                    0}
                  %
                </strong>
              </div>

              <div
                style={
                  styles.statItem
                }
              >
                👤 Face:
                <strong>
                  {" "}
                  {currentData?.face_detected
                    ? "Detected"
                    : "Not Detected"}
                </strong>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// STYLES
const styles = {
  page: {
    padding: 28,
    color: "#fff",
  },

  header: {
    marginBottom: 24,
    display: "flex",
    justifyContent:
      "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 16,
  },

  title: {
    fontSize: "2rem",
    fontWeight: 800,
    marginBottom: 8,
  },

  subtitle: {
    color: "#94a3b8",
  },

  sectionTitle: {
    marginBottom: 18,
    fontSize: "1.2rem",
    fontWeight: 700,
  },

  mainGrid: {
    display: "grid",
    gridTemplateColumns:
      "1.45fr 1fr",
    gap: 24,
    alignItems: "start",
  },

  leftColumn: {
    display: "flex",
    flexDirection: "column",
    gap: 24,
  },

  rightColumn: {
    display: "flex",
    flexDirection: "column",
    gap: 24,
  },

  card: {
    background:
      "rgba(255,255,255,0.05)",
    padding: 20,
    borderRadius: 20,
    border:
      "1px solid rgba(255,255,255,0.06)",
  },

  cameraWrapper: {
    width: "100%",
    minHeight: "360px",
    overflow: "hidden",
    borderRadius: "18px",
    background: "#0f172a",
    display: "flex",
    alignItems: "center",
    justifyContent:
      "center",
  },

  statItem: {
    marginBottom: 16,
    fontSize: "1rem",
    color: "#e2e8f0",
    lineHeight: 1.8,
  },

  alert: {
    background:
      "rgba(239,68,68,0.14)",
    border:
      "1px solid rgba(239,68,68,0.35)",
    color: "#fecaca",
    padding: 12,
    borderRadius: 12,
    marginTop: 10,
  },

  stopBtn: {
    padding: "12px 20px",
    borderRadius: 12,
    border: "none",
    background: "#ef4444",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 700,
  },
};