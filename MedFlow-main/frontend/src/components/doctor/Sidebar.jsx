import React from "react";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { cn } from "../../utils/helpers";

const TABS = {
  DASHBOARD: "dashboard",
  APPOINTMENTS: "appointments",
  EARNINGS: "earnings",
  PATIENTS: "patients",
  AVAILABILITY: "availability",
};

// Moved NavButton outside component to fix React Hooks violation
const NavButton = ({ active, onClick, title, subtitle }) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      "w-full text-left rounded-xl px-4 py-3 transition-colors border",
      active
        ? "border-emerald-500/40 bg-emerald-500/10"
        : "border-slate-800 bg-slate-900/30 hover:bg-slate-800/45"
    )}
  >
    <div className={cn("text-sm font-semibold", active ? "text-emerald-200" : "text-white")}>
      {title}
    </div>
    <div className="mt-0.5 text-xs text-slate-400">{subtitle}</div>
  </button>
);

export const Sidebar = ({ activeTab, setActiveTab, doctor }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const getInitials = (name) => {
    const text = String(name || "").trim();
    if (!text) return "DR";
    const parts = text.split(/\s+/).filter(Boolean);
    return parts
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() || "")
      .join("") || "DR";
  };

  return (
    <div className="flex h-full flex-col p-4 sm:p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-400 text-lg font-bold text-slate-950 shadow-inner">
          {getInitials(doctor?.name || user?.name)}
        </div>
        <div className="min-w-0">
          <div className="truncate font-semibold text-white">
            {doctor?.name || user?.name || "Doctor"}
          </div>
          <div className="text-xs text-emerald-400 truncate">
            {doctor?.specialization || "Doctor Panel"}
          </div>
        </div>
      </div>

      <nav className="mt-8 flex flex-col gap-2">
        <NavButton
          active={activeTab === TABS.DASHBOARD}
          onClick={() => setActiveTab(TABS.DASHBOARD)}
          title="Dashboard"
          subtitle="Today at a glance"
        />
        <NavButton
          active={activeTab === TABS.APPOINTMENTS}
          onClick={() => setActiveTab(TABS.APPOINTMENTS)}
          title="My Appointments"
          subtitle="Queue & actions"
        />
        <NavButton
          active={activeTab === TABS.EARNINGS}
          onClick={() => setActiveTab(TABS.EARNINGS)}
          title="Earnings"
          subtitle="Revenue insights"
        />
        <NavButton
          active={activeTab === TABS.PATIENTS}
          onClick={() => setActiveTab(TABS.PATIENTS)}
          title="Patients"
          subtitle="Linked records"
        />
        <NavButton
          active={activeTab === TABS.AVAILABILITY}
          onClick={() => setActiveTab(TABS.AVAILABILITY)}
          title="Availability"
          subtitle="Date and slots"
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
