import React, { useState } from "react";
import { Activity, CalendarCheck2, IndianRupee, Users } from "lucide-react";
import { getData } from "../../utils/storage.js";
import { ensureMedflowSeed } from "../../utils/seedMedflow.js";

const StatCard = ({ label, value, icon: Icon, accent }) => (
  <div className="rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-4 flex items-center justify-between">
    <div>
      <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold text-slate-50">
        {value ?? "—"}
      </p>
    </div>
    <div
      className={`h-10 w-10 rounded-xl flex items-center justify-center bg-gradient-to-br ${accent}`}
    >
      <Icon className="w-5 h-5 text-slate-950" />
    </div>
  </div>
);

// Helper function to compute initial stats
const computeInitialStats = () => {
  ensureMedflowSeed();
  const doctors = getData("medflow.doctors", []);
  const patients = getData("medflow.patients", []);
  const appointments = getData("medflow.appointments", []);
  const paidAppointments = (
    Array.isArray(appointments) ? appointments : []
  ).filter((a) => String(a?.paymentStatus || "").toLowerCase() === "paid");

  return {
    doctors: Array.isArray(doctors) ? doctors.length : 0,
    patients: Array.isArray(patients) ? patients.length : 0,
    appointments: Array.isArray(appointments) ? appointments.length : 0,
    payments: paidAppointments.length,
  };
};

const AdminDashboard = () => {
  // Use lazy initial state to compute stats once
  const [stats, setStats] = useState(computeInitialStats);
  const [loading, setLoading] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-xl md:text-2xl font-semibold text-slate-50">
          System overview
        </h1>
        <p className="text-sm text-slate-400 max-w-xl">
          High-level statistics across doctors, patients, appointments and
          system payments.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total doctors"
          value={loading && stats.doctors === null ? "…" : stats.doctors}
          icon={Activity}
          accent="from-sky-500 to-emerald-400"
        />
        <StatCard
          label="Total patients"
          value={loading && stats.patients === null ? "…" : stats.patients}
          icon={Users}
          accent="from-fuchsia-500 to-sky-400"
        />
        <StatCard
          label="Total appointments"
          value={
            loading && stats.appointments === null ? "…" : stats.appointments
          }
          icon={CalendarCheck2}
          accent="from-amber-400 to-orange-500"
        />
        <StatCard
          label="Total payments"
          value={loading && stats.payments === null ? "…" : stats.payments}
          icon={IndianRupee}
          accent="from-emerald-400 to-lime-400"
        />
      </div>
    </div>
  );
};

export default AdminDashboard;
