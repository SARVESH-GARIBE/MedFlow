import React from "react";
import { useLocation, Link } from "react-router-dom";
import { LogOut } from "lucide-react";
import { useAdminAuth } from "../../context/AdminAuthContext.jsx";

const TITLE_MAP = {
  "/admin": "Dashboard",
  "/admin/doctors": "Manage Doctors",
  "/admin/patients": "Manage Patients",
  "/admin/departments": "Manage Departments",
  "/admin/appointments": "Appointments Overview",
  "/admin/payments": "Payments Dashboard",
};

const AdminTopbar = () => {
  const location = useLocation();
  const { logout } = useAdminAuth();

  const title =
    TITLE_MAP[location.pathname] ||
    "Admin Panel";

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-950/70 backdrop-blur flex items-center justify-between px-4 lg:px-8">
      <div className="flex flex-col">
        <span className="text-xs uppercase tracking-[0.18em] text-slate-500">
          MedFlow
        </span>
        <span className="text-sm md:text-base font-semibold text-slate-100">
          {title}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <Link
          to="/"
          className="hidden sm:inline-flex text-xs px-3 py-1.5 rounded-full border border-slate-700 text-slate-300 hover:bg-slate-800/80 transition-colors"
        >
          Back to site
        </Link>
        <button
          type="button"
          onClick={logout}
          className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-slate-100 text-slate-950 hover:bg-slate-200 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign out</span>
        </button>
      </div>
    </header>
  );
};

export default AdminTopbar;

