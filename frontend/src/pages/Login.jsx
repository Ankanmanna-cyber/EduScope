import { useState } from "react";
import { useAuth } from "../services/authContext";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] =
    useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      await login(
        form.email,
        form.password
      );

      navigate("/dashboard");
    } catch (err) {
      console.log(
        "FULL ERROR:",
        err
      );

      console.log(
        "SERVER ERROR:",
        err.response?.data?.error
      );

      alert(
        err.response?.data?.error ||
          "Login failed"
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
            EduScope
          </h1>

          <p style={styles.tagline}>
            AI Based Smart Classroom
            Monitoring Platform
          </p>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div style={styles.right}>
        <div style={styles.formBox}>
          <h2 style={styles.title}>
            Welcome Back
          </h2>

          <p style={styles.subtitle}>
            Login to continue
          </p>

          {/* GOOGLE BUTTON */}
          <button style={styles.googleBtn}>
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="Google"
              style={{
                width: 20,
                marginRight: 10,
              }}
            />

            Sign in with Google
          </button>

          {/* DIVIDER */}
          <div style={styles.divider}>
            <span>OR</span>
          </div>

          {/* FORM */}
          <form
            onSubmit={handleSubmit}
            style={styles.form}
          >
            <input
              type="email"
              placeholder="Email Address"
              style={styles.input}
              onChange={(e) =>
                setForm({
                  ...form,
                  email:
                    e.target.value,
                })
              }
            />

            <input
              type="password"
              placeholder="Password"
              style={styles.input}
              onChange={(e) =>
                setForm({
                  ...form,
                  password:
                    e.target.value,
                })
              }
            />

            <button
              type="submit"
              style={styles.loginBtn}
            >
              {loading
                ? "Logging..."
                : "Login"}
            </button>
          </form>

          {/* REGISTER */}
          <p style={styles.footerText}>
            Don’t have an account?{" "}
            <Link
              to="/register"
              style={
                styles.registerLink
              }
            >
              Register
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

/* STYLES */

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
    maxWidth: 400,
    borderRadius: 25,
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

  googleBtn: {
    width: "100%",
    padding: "13px",
    borderRadius: 14,
    border:
      "1px solid #cbd5e1",
    background: "#fff",
    color: "#0f172a",
    cursor: "pointer",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontWeight: "500",
    marginBottom: 25,
    transition: "0.3s",
  },

  divider: {
    textAlign: "center",
    color: "#64748b",
    marginBottom: 25,
    fontSize: "0.85rem",
  },

  form: {
    display: "flex",
    flexDirection: "column",
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

  loginBtn: {
    padding: "15px",
    borderRadius: 14,
    border: "none",
    background:
      "linear-gradient(135deg,#6366f1,#8b5cf6)",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "1rem",
    marginTop: 10,
    boxShadow:
      "0 10px 25px rgba(99,102,241,0.3)",
    transition: "0.3s",
  },

  footerText: {
    marginTop: 25,
    textAlign: "center",
    color: "#475569",
    fontSize: "0.95rem",
  },

  registerLink: {
    color: "#7c3aed",
    textDecoration: "none",
    fontWeight: "600",
  },

  footer: {
    marginTop: 20,
    textAlign: "center",
    color: "#64748b",
    fontSize: "0.85rem",
  },
};