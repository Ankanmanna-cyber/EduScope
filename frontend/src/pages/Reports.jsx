import { useEffect, useState } from "react";
import axios from "axios";

export default function Reports() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSessions = async () => {
    try {
      const { data } = await axios.get(
        "http://localhost:5000/api/session/all",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );
      setSessions(data.sessions || []);
    } catch (err) {
      console.error("Error fetching sessions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <h2>📊 Session Reports</h2>

      {loading && <p>Loading...</p>}

      {!loading && sessions.length === 0 && (
        <p>No session data available</p>
      )}

      {sessions.map((session) => (
        <div key={session._id} style={{
          border: "1px solid #ddd",
          borderRadius: 8,
          padding: 16,
          marginBottom: 12
        }}>
          <p><strong>Class:</strong> {session.class_name}</p>
          <p><strong>Date:</strong> {new Date(session.created_at).toLocaleString()}</p>
          <p><strong>Average Engagement:</strong> {session.avg_score || 0}</p>
        </div>
      ))}
    </div>
  );
}