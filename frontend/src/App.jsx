import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./services/authContext";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Reports from "./pages/Reports";
import Layout from "./components/Layout";
import LiveMonitoring from "./pages/LiveMonitoring";

// 🔐 Protected Route
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ color: "#fff", padding: 40 }}>
        Loading...
      </div>
    );
  }

  return user ? children : <Navigate to="/login" replace />;
}

// 🌍 Public Route
function PublicRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ color: "#fff", padding: 40 }}>
        Loading...
      </div>
    );
  }

  return user ? <Navigate to="/dashboard" replace /> : children;
}

export default function App() {
  return (
    
      <AuthProvider>
        <Routes>

          {/* PUBLIC */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />

          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />

          {/* PROTECTED */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />

            <Route path="dashboard" element={<Dashboard />} />

            <Route path="live" element={<LiveMonitoring />} />

            <Route path="reports" element={<Reports />} />
          </Route>

          {/* FALLBACK */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />

        </Routes>
      </AuthProvider>
    
  );
}