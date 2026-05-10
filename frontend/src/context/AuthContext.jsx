import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import api from "../api/axios";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const { data } = await api.get("/auth/me");
      setUser(data.user);
    } catch {
      localStorage.removeItem("token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  async function login(credentials) {
    const { data } = await api.post("/auth/login", credentials);
    localStorage.setItem("token", data.token);
    setUser(data.user);
    return data.user;
  }

  async function signup(payload) {
    const { data } = await api.post("/auth/signup", payload);
    localStorage.setItem("token", data.token);
    setUser(data.user);
    return data.user;
  }

  function logout() {
    localStorage.removeItem("token");
    setUser(null);
  }

  const value = useMemo(
    () => {
      const managerRoles = ["ADMIN", "MANAGER"];
      const leadRoles = ["ADMIN", "MANAGER", "PROJECT_LEAD", "QA_LEAD"];
      return {
        user,
        loading,
        isAdmin: user?.role === "ADMIN",
        canManageProjects: managerRoles.includes(user?.role),
        canLeadWork: leadRoles.includes(user?.role),
        canCreateTasks: Boolean(user),
        login,
        signup,
        logout
      };
    },
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

