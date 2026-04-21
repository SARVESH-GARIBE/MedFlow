import React, { useState, useEffect, useCallback } from "react";
import { Sidebar } from "../components/patient/Sidebar.jsx";
import { PatientDashboard } from "../components/patient/PatientDashboard.jsx";
import { BookAppointment } from "../components/patient/BookAppointment.jsx";
import { DoctorSearch } from "../components/patient/DoctorSearch.jsx";
import { MyAppointments } from "../components/patient/MyAppointments.jsx";
import { PaymentsView } from "../components/patient/PaymentsView.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { fetchWithAuth } from "../services/api.js";
import { API_BASE_URL } from "../api/client.js";

const TABS = {
  DASHBOARD: "dashboard",
  SEARCH: "search",
  BOOK: "book",
  APPOINTMENTS: "appointments",
  PAYMENTS: "payments",
};

const Patient = () => {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState(
    window.localStorage.getItem("medflow.selectedDoctor")
      ? TABS.BOOK
      : TABS.DASHBOARD,
  );

  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [payments, setPayments] = useState([]);

  const [loadingInitial, setLoadingInitial] = useState(true);
  const [globalToast, setGlobalToast] = useState("");

  const refreshData = useCallback(async () => {
    const userId = user?.id || user?._id;
    if (!userId) {
      setLoadingInitial(false);
      return;
    }

    setLoadingInitial(true);
    try {
      const docsReq = fetch(`${API_BASE_URL}/doctors`)
        .then((res) => res.json())
        .catch(() => ({ success: false, data: [] }));

      const apptsReq = fetchWithAuth(`/appointments/patient/${userId}`).catch(
        () => ({ success: false, data: [] }),
      );

      const paymentsReq = fetchWithAuth(`/payments/patient/${userId}`).catch(
        () => ({ success: false, data: [] }),
      );

      const [apptsRes, paymentsRes, docsRes] = await Promise.all([
        apptsReq,
        paymentsReq,
        docsReq,
      ]);

      if (apptsRes?.success) setAppointments(apptsRes.data || []);
      if (paymentsRes?.success) setPayments(paymentsRes.data || []);
      if (docsRes?.success) setDoctors(docsRes.data || []);
    } catch (error) {
      console.error(error);
      setGlobalToast("Could not synchronize live data.");
    } finally {
      setLoadingInitial(false);
    }
  }, [user]);

  // Initial load
  useEffect(() => {
    refreshData();
  }, []); // ONLY ONCE

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
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      </aside>

      {/* Main Content Pane */}
      <main className="flex-1 bg-slate-950">
        <div className="mx-auto max-w-5xl p-4 sm:p-8 lg:p-12 h-full">
          {loadingInitial ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center space-y-4">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent mx-auto"></div>
                <div className="text-sm font-semibold text-slate-400">
                  Syncing with server...
                </div>
              </div>
            </div>
          ) : (
            <>
              {activeTab === TABS.DASHBOARD && (
                <PatientDashboard
                  patientName={user?.name}
                  appointments={appointments}
                />
              )}
              {activeTab === TABS.SEARCH && (
                <DoctorSearch
                  onSelectDoctor={(doctor) => {
                    setActiveTab(TABS.BOOK);
                  }}
                  setActiveTab={setActiveTab}
                  TABS={TABS}
                />
              )}
              {activeTab === TABS.BOOK && (
                <BookAppointment
                  doctors={doctors}
                  appointments={appointments}
                  refreshData={refreshData}
                  setToast={setGlobalToast}
                  TABS={TABS}
                  setActiveTab={setActiveTab}
                  user={user}
                />
              )}
              {activeTab === TABS.APPOINTMENTS && (
                <MyAppointments appointments={appointments} />
              )}
              {activeTab === TABS.PAYMENTS && (
                <PaymentsView
                  appointments={appointments}
                  payments={payments}
                  refreshData={refreshData}
                  setToast={setGlobalToast}
                />
              )}
            </>
          )}
        </div>
      </main>

      {/* Mobile Navbar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-800/60 bg-slate-900/90 backdrop-blur-md sm:hidden">
        <div className="flex justify-around p-3">
          <button
            onClick={() => setActiveTab(TABS.DASHBOARD)}
            className={`p-2 rounded-xl flex items-center justify-center transition-colors ${activeTab === TABS.DASHBOARD ? "bg-emerald-500/10 text-emerald-400" : "text-slate-400"}`}
          >
            <span className="text-xs font-semibold">Dash</span>
          </button>
          <button
            onClick={() => setActiveTab(TABS.SEARCH)}
            className={`p-2 rounded-xl flex items-center justify-center transition-colors ${activeTab === TABS.SEARCH ? "bg-emerald-500/10 text-emerald-400" : "text-slate-400"}`}
          >
            <span className="text-xs font-semibold">Search</span>
          </button>
          <button
            onClick={() => setActiveTab(TABS.BOOK)}
            className={`p-2 rounded-xl flex items-center justify-center transition-colors ${activeTab === TABS.BOOK ? "bg-emerald-500/10 text-emerald-400" : "text-slate-400"}`}
          >
            <span className="text-xs font-semibold">Book</span>
          </button>
          <button
            onClick={() => setActiveTab(TABS.APPOINTMENTS)}
            className={`p-2 rounded-xl flex items-center justify-center transition-colors ${activeTab === TABS.APPOINTMENTS ? "bg-emerald-500/10 text-emerald-400" : "text-slate-400"}`}
          >
            <span className="text-xs font-semibold">Appts</span>
          </button>
          <button
            onClick={() => setActiveTab(TABS.PAYMENTS)}
            className={`p-2 rounded-xl flex items-center justify-center transition-colors ${activeTab === TABS.PAYMENTS ? "bg-emerald-500/10 text-emerald-400" : "text-slate-400"}`}
          >
            <span className="text-xs font-semibold">Pay</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default Patient;
