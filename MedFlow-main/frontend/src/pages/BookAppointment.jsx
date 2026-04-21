import React, { useState, useEffect, useCallback } from "react";
import Navbar from "../components/Navbar.jsx";
import { BookAppointment as BookAppointmentComponent } from "../components/patient/BookAppointment.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { fetchWithAuth } from "../services/api.js";
import { API_BASE_URL } from "../api/client.js";

const BookAppointment = () => {
  console.log("BookAppointment loaded");
  const { user } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [toast, setToast] = useState("");

  const refreshData = useCallback(async () => {
    const userId = user?.id || user?._id;
    if (!userId) return;
    try {
      const docsReq = fetch(`${API_BASE_URL}/doctors`)
        .then((res) => res.json())
        .catch(() => ({ success: false, data: [] }));

      const apptsReq = fetchWithAuth(`/appointments/patient/${userId}`).catch(
        () => ({ success: false, data: [] })
      );

      const [apptsRes, docsRes] = await Promise.all([apptsReq, docsReq]);

      if (apptsRes?.success) setAppointments(apptsRes.data || []);
      if (docsRes?.success) setDoctors(docsRes.data || []);
    } catch (error) {
      console.error(error);
    }
  }, [user]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  return (
    <div className="bg-slate-950 min-h-screen text-white font-sans">
      <Navbar />
      <div className="max-w-5xl mx-auto p-4 md:p-8 mt-4">
        {toast && (
          <div className="mb-4 rounded-xl bg-slate-800 border border-slate-700 p-4">
            <p className="text-sm font-semibold text-slate-200">{toast}</p>
          </div>
        )}
        <BookAppointmentComponent 
          doctors={doctors}
          appointments={appointments}
          refreshData={refreshData}
          setToast={setToast}
          TABS={{}}
          setActiveTab={() => {}}
          user={user}
        />
      </div>
    </div>
  );
};

export default BookAppointment;
