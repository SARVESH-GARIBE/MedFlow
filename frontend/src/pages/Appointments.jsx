import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { API_BASE_URL } from "../api/client.js";

function availabilityTone(isAvailable) {
  if (isAvailable) {
    return "bg-emerald-500/10 text-emerald-200 ring-1 ring-emerald-500/30";
  }
  return "bg-amber-500/10 text-amber-200 ring-1 ring-amber-500/30";
}

const Appointments = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { token, user } = useAuth();

  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Read URL parameters for initial state
  const searchParam = searchParams.get("search") || "";
  const specParam = searchParams.get("specialization") || "all";

  const [search, setSearch] = useState(searchParam);
  const [specialization, setSpecialization] = useState(specParam);

  // Sync state back to URL parameters to allow sharing and deep linking
  useEffect(() => {
    const params = new URLSearchParams();
    if (search.trim()) params.set("search", search.trim());
    if (specialization !== "all") params.set("specialization", specialization);
    setSearchParams(params, { replace: true });
  }, [search, specialization, setSearchParams]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/doctors`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setDoctors(data.data);
        }
      })
      .catch((err) => console.error("Error fetching doctors:", err))
      .finally(() => setLoading(false));
  }, []);

  const specializations = useMemo(() => {
    const set = new Set(
      doctors
        .map((doctor) => String(doctor.specialization || "").trim())
        .filter(Boolean),
    );
    return ["all", ...Array.from(set)];
  }, [doctors]);

  const filteredDoctors = useMemo(() => {
    return doctors.filter((doctor) => {
      const name = String(doctor.name || "").toLowerCase();
      const doctorSpecialization = String(
        doctor.specialization || "",
      ).toLowerCase();
      const query = search.trim().toLowerCase();
      const matchesSearch = query ? name.includes(query) : true;
      const matchesSpecialization =
        specialization === "all"
          ? true
          : doctorSpecialization === specialization.toLowerCase();
      return matchesSearch && matchesSpecialization;
    });
  }, [doctors, search, specialization]);

  const onBook = (doctor) => {
    // Retaining basic selected Doctor caching strictly for the UI state transition
    window.localStorage.setItem(
      "medflow.selectedDoctor",
      JSON.stringify(doctor),
    );
    if (token) {
      if (user?.role === "patient") {
        navigate("/patient");
      } else {
        // Technically doctors shouldn't book appointments, but we handle it safely
        navigate("/doctor");
      }
    } else {
      // Direct guest to login flow
      navigate("/select-role");
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:py-10">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
            Find Doctors
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-400">
            Browse specialists and book your consultation in a few clicks.
          </p>
        </div>

        <div className="mb-6 grid gap-3 sm:grid-cols-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by doctor name"
            className="w-full rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-sm text-white placeholder:text-slate-400 outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/40"
          />
          <select
            value={specialization}
            onChange={(e) => setSpecialization(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-sm text-white outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/40"
          >
            {specializations.map((spec) => (
              <option key={spec} value={spec}>
                {spec === "all" ? "All Specializations" : spec}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-800/30 px-4 py-12 text-center text-slate-400">
            Loading doctors...
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredDoctors.map((doctor) => {
                const available = doctor.availability === "Available";
                return (
                  <article
                    key={doctor._id || doctor.id || doctor.name}
                    className="flex flex-col rounded-2xl border border-slate-800 bg-slate-800/40 p-5 shadow-[0_10px_30px_rgba(0,0,0,0.2)] transition-transform hover:-translate-y-0.5"
                  >
                    <h2 className="text-lg font-semibold text-white">
                      {doctor.name || "Doctor"}
                    </h2>
                    <p className="mt-1 text-sm text-slate-400">
                      {doctor.specialization || "General Practice"}
                    </p>

                    <div className="mt-4 mb-5 space-y-2 text-sm text-slate-300 flex-1">
                      <div className="flex items-center justify-between">
                        <span>Experience</span>
                        <span>{doctor.experience || "5+ Years"}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Consultation Fee</span>
                        <span>₹{Number(doctor.fee || 0)}</span>
                      </div>
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-700/50">
                        <span>Status</span>
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${availabilityTone(
                            available,
                          )}`}
                        >
                          {available ? "Available" : "Unavailable"}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onBook(doctor)}
                      className="mt-auto w-full rounded-xl bg-emerald-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition-colors hover:bg-emerald-300"
                    >
                      Book Appointment
                    </button>
                  </article>
                );
              })}
            </div>

            {filteredDoctors.length === 0 ? (
              <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-800/30 px-4 py-6 text-center text-slate-400">
                No doctors found for your search/filter.
              </div>
            ) : null}
          </>
        )}
      </main>
    </div>
  );
};

export default Appointments;
