import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAdminAuth } from "../../context/AdminAuthContext.jsx";

const AdminRoute = () => {
  const { isAdmin, loading } = useAdminAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
        <div className="animate-spin h-8 w-8 rounded-full border-4 border-slate-700 border-t-blue-500" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <Navigate
        to="/admin/login"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  return <Outlet />;
};

export default AdminRoute;

