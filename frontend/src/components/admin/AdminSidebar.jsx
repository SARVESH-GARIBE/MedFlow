import React from "react";
import { NavLink } from "react-router-dom";
import {
  BarChart3,
  CalendarDays,
  CreditCard,
  LayoutDashboard,
  Users,
  Stethoscope,
  Building2,
} from "lucide-react";

const navItems = [
  {
    to: "/admin",
    label: "Dashboard",
    icon: LayoutDashboard,
    end: true,
  },
  {
    to: "/admin/doctors",
    label: "Doctors",
    icon: Stethoscope,
  },
  {
    to: "/admin/patients",
    label: "Patients",
    icon: Users,
  },
  {
    to: "/admin/departments",
    label: "Departments",
    icon: Building2,
  },
  {
    to: "/admin/appointments",
    label: "Appointments",
    icon: CalendarDays,
  },
  {
    to: "/admin/payments",
    label: "Payments",
    icon: CreditCard,
  },
  {
    to: "/admin/analytics",
    label: "Analytics",
    icon: BarChart3,
    hidden: true,
  },
];

const AdminSidebar = () => {
  return (
    <aside className="hidden lg:flex lg:w-64 xl:w-72 flex-col border-r border-slate-800 bg-slate-950/80 backdrop-blur">
      <div className="h-16 flex items-center px-6 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-sky-500 to-emerald-400 flex items-center justify-center text-slate-950 font-bold text-lg">
            MF
          </div>
          <div>
            <div className="text-sm font-semibold tracking-wide">
              MedFlow Admin
            </div>
            <div className="text-[11px] text-slate-400 uppercase tracking-[0.18em]">
              CONTROL CENTER
            </div>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems
          .filter((n) => !n.hidden)
          .map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  [
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    "hover:bg-slate-800/80",
                    isActive
                      ? "bg-slate-800 text-sky-300"
                      : "text-slate-300",
                  ].join(" ")
                }
              >
                <Icon className="w-4.5 h-4.5" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
      </nav>

      <div className="p-4 border-t border-slate-800 text-xs text-slate-500">
        MedFlow &copy; {new Date().getFullYear()}
      </div>
    </aside>
  );
};

export default AdminSidebar;

