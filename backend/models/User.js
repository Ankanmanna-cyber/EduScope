const mongoose = require("mongoose");
const bcrypt   = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name:     { type: String, required: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },

  role: {
    type: String,
    enum: ["teacher", "student"],
    default: "teacher"
  },

  plan: {
    type: String,
    enum: ["free", "premium", "institution"],
    default: "free"
  },

  created_at: { type: Date, default: Date.now }
});

// ✅ MUST BE THIS (no next, no nesting)
userSchema.pre("save", async function () {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
});

module.exports = mongoose.model("User", userSchema);