const mongoose = require("mongoose");

const engagementEntrySchema = new mongoose.Schema({
  student_id:    String,
  timestamp:     Date,
  attention:     Number,
  emotion:       String,
  engagement_score: Number,
  engagement_label: String,
  face_detected: Boolean
});

const sessionSchema = new mongoose.Schema({
  session_id:   { type: String, required: true, unique: true },
  teacher_id:   String,
  class_name:   String,
  started_at:   { type: Date, default: Date.now },
  ended_at:     Date,
  is_active:    { type: Boolean, default: true },
  entries:      [engagementEntrySchema],
  summary: {
    avg_engagement: Number,
    total_students: Number,
    peak_attention_time: Date,
    low_attention_alerts: Number
  }
});

module.exports = mongoose.model("Session", sessionSchema);