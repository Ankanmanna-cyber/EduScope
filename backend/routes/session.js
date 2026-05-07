const express = require("express");
const router  = express.Router();
const axios   = require("axios");
const Session = require("../models/Session");
const auth    = require("../middleware/auth");

const AI_URL  = process.env.AI_SERVICE_URL || "http://localhost:5001";

// POST /api/session/start
router.post("/start", auth, async (req, res) => {
  try {
    const { class_name } = req.body;
    const session = new Session({
      session_id: `sess_${Date.now()}`,
      teacher_id: req.user.id,
      class_name
    });
    await session.save();
    res.json({ success: true, session_id: session.session_id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/session/analyze  — called per-frame from frontend
router.post("/analyze", auth, async (req, res) => {
  try {
    const { session_id, student_id, frame } = req.body;

    // Forward frame to Python AI service
    const aiResponse = await axios.post(`${AI_URL}/analyze`, {
      frame, student_id
    }, { timeout: 3000 });    // 3s timeout for <2s latency requirement

    const result = aiResponse.data;

    // Store in MongoDB
    await Session.findOneAndUpdate(
      { session_id },
      {
        $push: {
          entries: {
            student_id,
            timestamp:        new Date(result.timestamp * 1000),
            attention:        result.attention,
            emotion:          result.emotion,
            engagement_score: result.engagement.score,
            engagement_label: result.engagement.label,
            face_detected:    result.face_detected
          }
        }
      }
    );

    // Alert if engagement is critically low
    const alert = result.engagement.score < 30
      ? { type: "LOW_ENGAGEMENT", student_id, score: result.engagement.score }
      : null;

    res.json({ result, alert });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/session/:id/report
router.get("/:id/report", auth, async (req, res) => {
  try {
    const session = await Session.findOne({ session_id: req.params.id });
    if (!session) return res.status(404).json({ error: "Session not found" });

    // Calculate summary
    const entries = session.entries;
    const avgEng  = entries.reduce((s, e) => s + e.engagement_score, 0) / (entries.length || 1);
    const students = [...new Set(entries.map(e => e.student_id))];

    // Group by student
    const studentMap = {};
    students.forEach(sid => {
      const sEntries = entries.filter(e => e.student_id === sid);
      studentMap[sid] = {
        avg_engagement: sEntries.reduce((s, e) => s + e.engagement_score, 0) / sEntries.length,
        dominant_emotion: mostCommon(sEntries.map(e => e.emotion)),
        data_points: sEntries.length
      };
    });

    res.json({
      session_id: session.session_id,
      class_name: session.class_name,
      duration_minutes: session.ended_at
        ? (session.ended_at - session.started_at) / 60000
        : null,
      avg_engagement: Math.round(avgEng * 10) / 10,
      total_students: students.length,
      student_breakdown: studentMap
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

function mostCommon(arr) {
  return arr.sort((a, b) =>
    arr.filter(v => v === a).length - arr.filter(v => v === b).length
  ).pop();
}

module.exports = router;