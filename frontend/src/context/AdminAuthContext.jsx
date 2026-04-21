import React, { createContext, useContext, useEffect, useState } from "react";

const AdminAuthContext = createContext(null);

const ADMIN_EMAIL =
  import.meta.env.VITE_ADMIN_EMAIL || "admin@medflow.local";
const ADMIN_PASSWORD =
  import.meta.env.VITE_ADMIN_PASSWORD || "admin123";

export function AdminAuthProvider({ children }) {
  // Use lazy initial state to read from localStorage once
  const [isAdmin, setIsAdmin] = useState(() => {
    return window.localStorage.getItem("medflow_admin_auth") === "true";
  });
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1"}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      
      if (data.success && (data.user.role === 'admin' || data.user.role === 'super_admin')) {
        window.localStorage.setItem("medflow_admin_auth", "true");
        window.localStorage.setItem("medflow_admin_token", data.token); // Store real JWT for API access
        setIsAdmin(true);
        return { success: true };
      }
      return {
        success: false,
        message: data.message || "Invalid admin credentials or role",
      };
    } catch (error) {
      console.error("Admin login error:", error);
      return {
        success: false,
        message: "Server error. Could not connect to API."
      };
    }
  };

  const logout = () => {
    window.localStorage.removeItem("medflow_admin_auth");
    window.localStorage.removeItem("medflow_admin_token");
    setIsAdmin(false);
  };

  return (
    <AdminAuthContext.Provider value={{ isAdmin, loading, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) {
    throw new Error("useAdminAuth must be used within AdminAuthProvider");
  }
  return ctx;
}

