import React from "react";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function cn(...parts) {
  return parts.filter(Boolean).join(" ");
}

function getInitials(name) {
  const parts = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  const first = parts[0]?.[0] || "P";
  const second = parts[1]?.[0] || parts[0]?.[1] || "";
  return (first + second).toUpperCase();
}

const TABS = {
  DASHBOARD: "dashboard",
  SEARCH: "search",
  BOOK: "book",
  APPOINTMENTS: "appointments",
  PAYMENTS: "payments",
};

// Moved NavButton outside component to fix React Hooks violation
const NavButton = ({ active, onClick, title, subtitle }) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      "w-full text-left rounded-2xl px-4 py-3 transition-colors border",
      active
        ? "border-emerald-500/40 bg-emerald-500/10"
        : "border-slate-800 bg-slate-900/30 hover:bg-slate-800/45",
    )}
  >
    <div
      className={cn(
        "text-sm font-semibold",
        active ? "text-emerald-200" : "text-white",
      )}
    >
      {title}
    </div>
    <div className="mt-0.5 text-xs text-slate-400">{subtitle}</div>
  </button>
);

export const Sidebar = ({ activeTab, setActiveTab }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="flex h-full flex-col p-4 sm:p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-400 text-lg font-bold text-slate-950 shadow-inner">
          {getInitials(user?.name)}
        </div>
        <div className="min-w-0">
          <div className="truncate font-semibold text-white">
            {user?.name || "Patient"}
          </div>
          <div className="text-xs text-emerald-400">Patient account</div>
        </div>
      </div>

      <nav className="mt-8 flex flex-col gap-2">
        <NavButton
          active={activeTab === TABS.DASHBOARD}
          onClick={() => setActiveTab(TABS.DASHBOARD)}
          title="Dashboard"
          subtitle="Overview & next steps"
        />
        <NavButton
          active={activeTab === TABS.SEARCH}
          onClick={() => setActiveTab(TABS.SEARCH)}
          title="Find Doctors"
          subtitle="Search nearby doctors"
        />
        <NavButton
          active={activeTab === TABS.BOOK}
          onClick={() => navigate("/book")}
          title="Book Appointment"
          subtitle="Find slots & request"
        />
        <NavButton
          active={activeTab === TABS.APPOINTMENTS}
          onClick={() => setActiveTab(TABS.APPOINTMENTS)}
          title="My Appointments"
          subtitle="Past & upcoming"
        />
        <NavButton
          active={activeTab === TABS.PAYMENTS}
          onClick={() => setActiveTab(TABS.PAYMENTS)}
          title="Payments"
          subtitle="Invoices & history"
        />
      </nav>

      <div className="mt-auto pt-6">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm font-semibold text-rose-400 transition-colors hover:bg-rose-500/20"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </div>
  );
};
