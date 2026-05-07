import { useState } from "react";
import {
  useNavigate,
  Link,
} from "react-router-dom";

import { authService } from "../services/api";

export default function Register() {
  const navigate =
    useNavigate();

  // FORM STATE
  const [form, setForm] =
    useState({
      name: "",
      email: "",
      password: "",
      role: "teacher",
    });

  // UI STATE
  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  // HANDLE INPUT
  const handleChange = (
    e
  ) => {
    setForm({
      ...form,
      [e.target.name]:
        e.target.value,
    });
  };

  // HANDLE SUBMIT
  const handleSubmit =
    async (e) => {
      e.preventDefault();

      setLoading(true);
      setError("");

      try {
        // REGISTER USER
        await authService.register(
          {
            name:
              form.name,
            email:
              form.email,
            password:
              form.password,
            role:
              form.role,
          }
        );

        // GO TO LOGIN
        navigate("/login");
      } catch (err) {
        console.error(
          "REGISTER ERROR:",
          err.response
            ?.data ||
            err.message
        );

        setError(
          err.response
            ?.data
            ?.error ||
            "Registration failed"
        );
      } finally {
        setLoading(false);
      }
    };

  return (
    <div style={styles.container}>
      {/* LEFT SIDE */}
      <div style={styles.left}>
        <div style={styles.overlay}></div>

        <div style={styles.leftContent}>
          <img
            src="logo.jpeg"
            alt="EduScope"
            style={styles.logo}
          />

          <h1 style={styles.brand}>
            Join EduScope
          </h1>

          <p style={styles.tagline}>
            Create your account and
            start your smart learning
            experience
          </p>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div style={styles.right}>
        <div style={styles.formBox}>
          <h2 style={styles.title}>
            Create Account
          </h2>

          <p style={styles.subtitle}>
            Register to continue
          </p>

          {/* ERROR */}
          {error && (
            <div style={styles.error}>
              {error}
            </div>
          )}

          {/* FORM */}
          <form
            onSubmit={handleSubmit}
            style={styles.form}
          >
            {/* NAME */}
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={form.name}
              onChange={
                handleChange
              }
              style={styles.input}
              required
            />

            {/* EMAIL */}
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={form.email}
              onChange={
                handleChange
              }
              style={styles.input}
              required
            />

            {/* PASSWORD */}
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={
                form.password
              }
              onChange={
                handleChange
              }
              style={styles.input}
              required
            />

            {/* ROLE */}
            <select
              name="role"
              value={form.role}
              onChange={
                handleChange
              }
              style={styles.input}
            >
              <option value="teacher">
                Teacher
              </option>

              <option value="student">
                Student
              </option>
            </select>

            {/* BUTTON */}
            <button
              type="submit"
              style={
                styles.registerBtn
              }
              disabled={
                loading
              }
            >
              {loading
                ? "Creating..."
                : "Register"}
            </button>
          </form>

          {/* FOOTER */}
          <p style={styles.footerText}>
            Already have an account?{" "}
            <Link
              to="/login"
              style={styles.link}
            >
              Login
            </Link>
          </p>

          <p style={styles.footer}>
            ©2026 EduScope
          </p>
        </div>
      </div>
    </div>
  );
}

// STYLES

const styles = {
  container: {
    display: "flex",
    height: "100vh",
    fontFamily:
      "'Poppins', sans-serif",
    overflow: "hidden",
    background:
      "linear-gradient(135deg,#eef2ff,#f8fafc)",
  },

  /* LEFT SIDE */

  left: {
    flex: 1,
    position: "relative",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background:
      "linear-gradient(135deg,#818cf8,#c4b5fd)",
  },

  overlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
    background:
      "radial-gradient(circle at top left, rgba(255,255,255,0.35), transparent 40%)",
  },

  leftContent: {
    position: "relative",
    zIndex: 2,
    textAlign: "center",
    color: "#fff",
    padding: 40,
  },

  logo: {
    width: "75%",
    maxWidth: 380,
    borderRadius: 24,
    boxShadow:
      "0 10px 40px rgba(0,0,0,0.2)",
    marginBottom: 30,
  },

  brand: {
    fontSize: "3.3rem",
    fontWeight: "800",
    marginBottom: 15,
    color: "#ffffff",
    textShadow:
      "0 5px 20px rgba(0,0,0,0.2)",
  },

  tagline: {
    fontSize: "1.15rem",
    color: "#fef9c3",
    lineHeight: 1.8,
    fontWeight: "600",
    textShadow:
      "0 2px 10px rgba(0,0,0,0.15)",
    maxWidth: 450,
  },

  /* RIGHT SIDE */

  right: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    background:
      "linear-gradient(135deg,#f8fafc,#eef2ff)",
  },

  formBox: {
    width: 380,
    padding: "45px 35px",
    borderRadius: 25,
    background:
      "linear-gradient(135deg,#ffffff,#eef2ff)",
    backdropFilter: "blur(18px)",
    border:
      "1px solid rgba(99,102,241,0.15)",
    boxShadow:
      "0 15px 40px rgba(99,102,241,0.18)",
    color: "#0f172a",
  },

  title: {
    fontSize: "2.2rem",
    marginBottom: 12,
    fontWeight: "800",
    textAlign: "center",
    background:
      "linear-gradient(135deg,#4f46e5,#7c3aed)",
    WebkitBackgroundClip:
      "text",
    WebkitTextFillColor:
      "transparent",
  },

  subtitle: {
    fontSize: "1rem",
    marginBottom: 30,
    textAlign: "center",
    fontWeight: "600",
    color: "#6366f1",
    letterSpacing: "0.3px",
  },

  form: {
    display: "flex",
    flexDirection:
      "column",
    gap: 18,
  },

  input: {
    padding: "15px",
    borderRadius: 14,
    border:
      "1px solid #cbd5e1",
    background: "#fff",
    color: "#0f172a",
    outline: "none",
    fontSize: "0.95rem",
    boxShadow:
      "0 2px 10px rgba(0,0,0,0.03)",
  },

  registerBtn: {
    padding: "15px",
    borderRadius: 14,
    border: "none",
    background:
      "linear-gradient(135deg,#6366f1,#8b5cf6)",
    color: "#fff",
    cursor: "pointer",
    marginTop: 10,
    fontWeight: "600",
    fontSize: "1rem",
    boxShadow:
      "0 10px 25px rgba(99,102,241,0.3)",
    transition: "0.3s",
  },

  footerText: {
    marginTop: 25,
    fontSize: "0.95rem",
    color: "#475569",
    textAlign: "center",
  },

  link: {
    color: "#7c3aed",
    fontWeight: "600",
    textDecoration:
      "none",
  },

  footer: {
    marginTop: 20,
    textAlign: "center",
    color: "#64748b",
    fontSize: "0.85rem",
  },

  error: {
    background:
      "rgba(239,68,68,0.1)",
    color: "#dc2626",
    padding: 12,
    borderRadius: 12,
    marginBottom: 18,
    fontSize: "0.9rem",
    border:
      "1px solid rgba(239,68,68,0.2)",
  },
};