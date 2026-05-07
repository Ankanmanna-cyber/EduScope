const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// REGISTER
exports.registerUser = async (req, res) => {
  try {
    console.log("REQ BODY:", req.body);   // 🔥 see incoming data

    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const user = new User({
      name,
      email,
      password,
      role
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: "User registered successfully"
    });

  } catch (err) {
    console.error("❌ REGISTER ERROR FULL:", err);   // 🔥 VERY IMPORTANT
    res.status(500).json({
      error: err.message,
      stack: err.stack   // 🔥 TEMP (for debugging)
    });
  }
};
// LOGIN
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    


    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid password" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "secret123",
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        role: user.role
      }
    });

  }catch (err) {
  console.error("REGISTER ERROR:", err);
  res.status(500).json({
    error: err.message || "Internal Server Error"
  });
}
};
// ─────────────────────────────────────────────
// GET CURRENT USER
// GET /api/auth/me
// ─────────────────────────────────────────────
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(
      req.user.id
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        plan: user.plan,
        created_at: user.created_at,
      },
    });
  } catch (err) {
    console.error(
      "GET CURRENT USER ERROR:",
      err
    );

    res.status(500).json({
      error: "Server error",
    });
  }
};