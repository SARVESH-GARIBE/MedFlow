import React, { useState, useEffect, useCallback } from "react";
import { Sidebar } from "../components/doctor/Sidebar.jsx";
import { Dashboard } from "../components/doctor/Dashboard.jsx";
import { AppointmentsView } from "../components/doctor/AppointmentsView.jsx";
import { EarningsView } from "../components/doctor/EarningsView.jsx";
import { PatientsView } from "../components/doctor/PatientsView.jsx";
import { AvailabilityView } from "../components/doctor/AvailabilityView.jsx";
import { fetchWithAuth } from "../services/api.js";

const TABS = {
  DASHBOARD: "dashboard",
  APPOINTMENTS: "appointments",
  EARNINGS: "earnings",
  PATIENTS: "patients",
  AVAILABILITY: "availability",
};

const Doctor = () => {
  const [activeTab, setActiveTab] = useState(TABS.DASHBOARD);

  const [doctor, setDoctor] = useState({});
  const [appointments, setAppointments] = useState([]);
  const [payments, setPayments] = useState([]);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [todayEarnings, setTodayEarnings] = useState(0);

  const [loadingInitial, setLoadingInitial] = useState(true);
  const [globalToast, setGlobalToast] = useState("");

  const refreshData = useCallback(async () => {
    try {
      const [docRes, apptsRes, payRes] = await Promise.all([
        fetchWithAuth("/doctors/me"),
        fetchWithAuth("/appointments/doctor"),
        fetchWithAuth("/payments/doctor"),
      ]);

      if (docRes.success) setDoctor(docRes.data || {});
      if (apptsRes.success) setAppointments(apptsRes.data || []);

      if (payRes.success) {
        setPayments(payRes.data || []);
        setTotalEarnings(payRes.totalEarnings || 0);
        setTodayEarnings(payRes.todayEarnings || 0);
      }
    } catch (err) {
      console.error("Error refreshing doctor data:", err);
      // setGlobalToast("Could not synchronize live data.");
    } finally {
      setLoadingInitial(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    refreshData();
  }, []); // ONLY ONCE as requested

  // Remove global toast after 4s
  useEffect(() => {
    if (globalToast) {
      const timer = setTimeout(() => setGlobalToast(""), 4000);
      return () => clearTimeout(timer);
    }
  }, [globalToast]);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950 text-white font-sans">
      {/* Toast Notification */}
      {globalToast && (
        <div className="fixed top-6 right-6 z-50 animate-in fade-in slide-in-from-top-5 rounded-2xl bg-slate-800 border border-slate-700 p-4 shadow-xl">
          <p className="text-sm font-semibold text-slate-200">{globalToast}</p>
        </div>
      )}

      {/* Sidebar Layout */}
      <aside className="hidden w-[280px] shrink-0 border-r border-slate-800/60 bg-slate-900/40 sm:block">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          doctor={doctor}
        />
      </aside>

      {/* Main Content Pane */}
      <main className="flex-1 bg-slate-950 relative overflow-hidden">
        <div className="mx-auto max-w-6xl p-4 sm:p-8 lg:p-12 h-full relative z-10">
          {loadingInitial ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center space-y-4">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent mx-auto"></div>
                <div className="text-sm font-semibold text-slate-400">
                  Syncing practice data...
                </div>
              </div>
            </div>
          ) : (
            <>
              {activeTab === TABS.DASHBOARD && (
                <Dashboard
                  doctor={doctor}
                  appointments={appointments}
                  todayEarnings={todayEarnings}
                />
              )}
              {activeTab === TABS.APPOINTMENTS && (
                <AppointmentsView
                  appointments={appointments}
                  refreshData={refreshData}
                  setToast={setGlobalToast}
                />
              )}
              {activeTab === TABS.EARNINGS && (
                <EarningsView
                  payments={payments}
                  totalEarnings={totalEarnings}
                  todayEarnings={todayEarnings}
                />
              )}
              {activeTab === TABS.PATIENTS && (
                <PatientsView appointments={appointments} />
              )}
              {activeTab === TABS.AVAILABILITY && (
                <AvailabilityView
                  doctor={doctor}
                  refreshData={refreshData}
                  setToast={setGlobalToast}
                />
              )}
            </>
          )}
        </div>
      </main>

      {/* Mobile Navbar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-800/60 bg-slate-900/95 backdrop-blur-md sm:hidden flex flex-wrap justify-around p-2 gap-y-2">
        <button
          onClick={() => setActiveTab(TABS.DASHBOARD)}
          className={`p-2 rounded-xl flex items-center justify-center transition-colors min-w-[60px] ${activeTab === TABS.DASHBOARD ? "bg-emerald-500/10 text-emerald-400" : "text-slate-400"}`}
        >
          <span className="text-[10px] sm:text-xs font-semibold uppercase">
            Dash
          </span>
        </button>
        <button
          onClick={() => setActiveTab(TABS.APPOINTMENTS)}
          className={`p-2 rounded-xl flex items-center justify-center transition-colors min-w-[60px] ${activeTab === TABS.APPOINTMENTS ? "bg-emerald-500/10 text-emerald-400" : "text-slate-400"}`}
        >
          <span className="text-[10px] sm:text-xs font-semibold uppercase">
            Appts
          </span>
        </button>
        <button
          onClick={() => setActiveTab(TABS.EARNINGS)}
          className={`p-2 rounded-xl flex items-center justify-center transition-colors min-w-[60px] ${activeTab === TABS.EARNINGS ? "bg-emerald-500/10 text-emerald-400" : "text-slate-400"}`}
        >
          <span className="text-[10px] sm:text-xs font-semibold uppercase">
            Earn
          </span>
        </button>
        <button
          onClick={() => setActiveTab(TABS.PATIENTS)}
          className={`p-2 rounded-xl flex items-center justify-center transition-colors min-w-[60px] ${activeTab === TABS.PATIENTS ? "bg-emerald-500/10 text-emerald-400" : "text-slate-400"}`}
        >
          <span className="text-[10px] sm:text-xs font-semibold uppercase">
            Patients
          </span>
        </button>
        <button
          onClick={() => setActiveTab(TABS.AVAILABILITY)}
          className={`p-2 rounded-xl flex items-center justify-center transition-colors min-w-[60px] ${activeTab === TABS.AVAILABILITY ? "bg-emerald-500/10 text-emerald-400" : "text-slate-400"}`}
        >
          <span className="text-[10px] sm:text-xs font-semibold uppercase">
            Avail
          </span>
        </button>
      </nav>
    </div>
  );
};

export default Doctor;
