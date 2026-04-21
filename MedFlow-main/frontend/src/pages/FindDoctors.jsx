import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { DoctorSearch } from "../components/patient/DoctorSearch";

const FindDoctors = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [initialCity] = useState(searchParams.get("city") || "");
  const [initialArea] = useState(searchParams.get("area") || "");

  const handleSelectDoctor = (doctor) => {
    // Navigate to Doctor Profile page as requested
    navigate(`/doctor/${doctor._id}`);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-12">
        <DoctorSearch
          initialCity={initialCity}
          initialArea={initialArea}
          onSelectDoctor={handleSelectDoctor}
        />
      </main>
    </div>
  );
};

export default FindDoctors;
