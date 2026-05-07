import {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";

import { authService } from "./api";

// ─────────────────────────────────────────────
// AUTH CONTEXT
// ─────────────────────────────────────────────
const AuthContext =
  createContext(null);

// ─────────────────────────────────────────────
// AUTH PROVIDER
// ─────────────────────────────────────────────
export function AuthProvider({
  children,
}) {
  const [user, setUser] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  // ─────────────────────────────────────────────
  // ON APP LOAD:
  // Restore user from token
  // ─────────────────────────────────────────────
  useEffect(() => {
    const initializeAuth =
      async () => {
        const token =
          localStorage.getItem(
            "token"
          );

        // No token
        if (!token) {
          setLoading(
            false
          );
          return;
        }

        try {
          // Validate token + restore user
          const { data } =
            await authService.getProfile();

          if (
            data?.user
          ) {
            setUser(
              data.user
            );
          } else {
            // Invalid response
            localStorage.removeItem(
              "token"
            );
            setUser(
              null
            );
          }
        } catch (err) {
          console.error(
            "Auth restore failed:",
            err.response
              ?.data ||
              err.message
          );

          // Invalid token
          localStorage.removeItem(
            "token"
          );

          localStorage.removeItem(
            "activeSessionId"
          );

          localStorage.removeItem(
            "lastSessionId"
          );

          setUser(
            null
          );
        } finally {
          setLoading(
            false
          );
        }
      };

    initializeAuth();
  }, []);

  // ─────────────────────────────────────────────
  // LOGIN
  // Fresh login = clear old sessions
  // ─────────────────────────────────────────────
 const login = async (
  email,
  password
) => {
  const { data } =
    await authService.login(
      email,
      password
    );

  // Clear old sessions
  localStorage.removeItem(
    "activeSessionId"
  );

  localStorage.removeItem(
    "lastSessionId"
  );

  // Save token
  localStorage.setItem(
    "token",
    data.token
  );

  // Save user to localStorage
  localStorage.setItem(
    "user",
    JSON.stringify(
      data.user || {
        name:
          data.name ||
          data.username ||
          "User",
      }
    )
  );

  // Save user to React state
  setUser(
    data.user || {
      name:
        data.name ||
        data.username ||
        "User",
    }
  );
};

  // ─────────────────────────────────────────────
  // LOGOUT
  // ─────────────────────────────────────────────
  const logout = () => {
    localStorage.removeItem(
      "token"
    );

    localStorage.removeItem(
      "activeSessionId"
    );

    localStorage.removeItem(
      "lastSessionId"
    );

    setUser(null);
  };

  // ─────────────────────────────────────────────
  // PROVIDER
  // ─────────────────────────────────────────────
  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth =
  () =>
    useContext(
      AuthContext
    );