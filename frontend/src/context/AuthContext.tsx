import React, { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import axios from "axios";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    role: string,
    businessProfile?: any,
  ) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token"),
  );
  const [loading, setLoading] = useState(true);

  // Set global axios defaults
  axios.defaults.baseURL =
    import.meta.env.VITE_API_URL ||
    (import.meta.env.PROD ? "" : "http://localhost:5000");

  // Request Interceptor: Attach token to every request
  useEffect(() => {
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        const storedToken = localStorage.getItem("token");
        if (storedToken) {
          config.headers.Authorization = `Bearer ${storedToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error),
    );

    // Response Interceptor: Handle 401s and auto-logout
    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Automatic logout on unauthorized status
          logout();
        }
        return Promise.reject(error);
      },
    );

    // Cleanup interceptors on unmount
    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  // Initial load: Fetch user data if token exists
  useEffect(() => {
    if (token) {
      axios
        .get("/api/auth/me")
        .then((response) => {
          setUser(response.data);
        })
        .catch(() => {
          logout(); // Comprehensive cleanup if me call fails
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post("/api/auth/login", { email, password });
      const { token: newToken, user: userData } = response.data;

      // 1. Store in localStorage (Persistent Storage)
      localStorage.setItem("token", newToken);

      // 2. Update React State (UI Refresh)
      setToken(newToken);
      setUser(userData);

      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    role: string,
    businessProfile?: any,
  ) => {
    try {
      const requestData: any = {
        name,
        email,
        password,
        role,
      };

      if (businessProfile) {
        requestData.businessProfile = businessProfile;
      }

      const response = await axios.post("/api/auth/register", requestData);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    // 1. Remove from localStorage (Purge Storage)
    localStorage.removeItem("token");

    // 2. Clear React State (Purge UI State)
    setToken(null);
    setUser(null);

    // 3. Clear Axios Headers (Purge Network Config)
    delete axios.defaults.headers.common["Authorization"];

    console.log("Logout successful: Tokens cleared from storage.");
  };

  const value = {
    user,
    token,
    login,
    register,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
