import axios from "axios";

// AXIOS INSTANCE
const api = axios.create({
  baseURL:
    "http://localhost:5000/api",
});

// AUTO TOKEN
api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem(
        "token"
      );

    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`;
    }

    return config;
  },

  (error) => {
    return Promise.reject(
      error
    );
  }
);

// AUTH SERVICE
export const authService =
  {
    login: (
      email,
      password
    ) =>
      api.post(
        "/auth/login",
        {
          email,
          password,
        }
      ),

    register: (
      userData
    ) =>
      api.post(
        "/auth/register",
        userData
      ),

    getProfile: () =>
      api.get(
        "/auth/profile"
      ),
  };

export default api;