import React, { useState, useEffect } from "react";
import { fetchWithAuth } from "../../services/api.js";
import { cn } from "../../utils/helpers.js";
import MapView from "./MapView.jsx";

const CITIES = [
  "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai",
  "Kolkata", "Pune", "Ahmedabad", "Jaipur", "Lucknow",
  "Chandigarh", "Indore",
];

const AREAS_BY_CITY = {
  Mumbai: ["Bandra", "Worli", "Andheri", "Dadar", "Fort", "Vile Parle", "Borivali"],
  Delhi: ["South Delhi", "North Delhi", "East Delhi", "West Delhi", "Central"],
  Bangalore: ["Whitefield", "Indiranagar", "Koramangala", "HSR Layout", "Marathon", "Ulsoor"],
  Hyderabad: ["Jubilee Hills", "Banjara Hills", "Kachiguda", "Secunderabad", "Somajiguda"],
  Chennai: ["Anna Nagar", "Chetpet", "T Nagar", "Velachery", "Guindy"],
  Kolkata: ["Park Circus", "Alipore", "Bidhannagar", "Bhowanipur", "Kalikapur"],
  Pune: ["Koregaon Park", "Kothrud", "Hinjewadi", "Viman Nagar", "Yerwada"],
  Ahmedabad: ["Ahmedabad East", "Ahmedabad West", "South Ahmedabad", "Old City"],
  Jaipur: ["C-Scheme", "S.I.T", "Malviya Nagar", "Vaishali Nagar", "Banasthali"],
  Lucknow: ["Gomti Nagar", "Indira Nagar", "Alambagh", "Hazratganj", "Lucknowganj"],
  Chandigarh: ["Sector 17", "Sector 22", "Sector 35", "Sector 43", "Panchkula"],
  Indore: ["Rajwada", "Khajrana", "Rau", "Vijay Nagar", "Pologround"],
};

function Card({ children, className }) {
  return (
    <div className={cn("rounded-2xl border border-slate-800 bg-slate-800/30 shadow-[0_10px_30px_rgba(0,0,0,0.18)]", className)}>
      {children}
    </div>
  );
}

function SectionTitle({ title, subtitle }) {
  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-white">{title}</h1>
      {subtitle && <p className="text-sm text-slate-400">{subtitle}</p>}
    </div>
  );
}

function DoctorCard({ doctor, onSelect, onViewMap }) {
  const clinicBadge = doctor.clinicType === "government" ? "🏥" : "🏢";
  const badgeLabel = doctor.clinicType === "government" ? "Government" : "Private";
  const isAvailable = doctor.availability === "Available";

  return (
    <Card className="p-5 hover:bg-slate-800/50 transition-all cursor-pointer group overflow-hidden border-l-4 border-l-emerald-500/30" onClick={onSelect}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <h3 className="text-white font-bold text-sm sm:text-base truncate group-hover:text-emerald-400 transition">{doctor.name}</h3>
            <div className="flex items-center gap-1">
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-700/50 text-slate-300" title={badgeLabel}>
                {clinicBadge} {badgeLabel}
              </span>
              {isAvailable && (
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400">✓ Available</span>
              )}
            </div>
          </div>
          <p className="text-xs sm:text-sm text-emerald-400 font-semibold mb-2">🔬 {doctor.specialization || "General Practitioner"}</p>
          {doctor.locationDetails?.city && (
            <div className="text-xs sm:text-sm text-slate-400 mb-2 flex items-start gap-1">
              <span className="shrink-0 mt-0.5">📍</span>
              <span>
                {doctor.locationDetails.area && <strong>{doctor.locationDetails.area}, </strong>}
                {doctor.locationDetails.city}
              </span>
            </div>
          )}
          <div className="flex items-center gap-4 mb-3 text-xs sm:text-sm flex-wrap">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5">
                <span className="text-yellow-400">⭐</span>
                <span className="font-bold text-white">{(doctor.rating || 0).toFixed(1)}</span>
              </div>
              <span className="text-slate-500">({doctor.reviewCount || 0} reviews)</span>
            </div>
            <div className="flex items-center gap-1 text-emerald-300 font-semibold">
              <span>💰</span><span>₹{doctor.fee || 0}</span>
            </div>
          </div>
          {(doctor.experience || doctor.qualifications) && (
            <p className="text-[11px] text-slate-400 mb-2 line-clamp-1">
              {doctor.experience && `${doctor.experience} yrs exp${doctor.qualifications ? " • " : ""}`}
              {doctor.qualifications && doctor.qualifications}
            </p>
          )}
          {doctor.acceptedInsurance?.length > 0 && (
            <div className="mt-1 mb-2 flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Accepts:</span>
              {doctor.acceptedInsurance.slice(0, 3).map((ins, i) => (
                <span key={i} className="text-[10px] px-1.5 py-0.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-md font-medium tracking-wide">
                  🛡️ {ins}
                </span>
              ))}
              {doctor.acceptedInsurance.length > 3 && (
                <span className="text-[10px] font-bold text-blue-400 px-1 py-0.5 bg-blue-500/10 rounded border border-blue-500/20">
                  +{doctor.acceptedInsurance.length - 3}
                </span>
              )}
            </div>
          )}
          {(doctor.locationDetails?.lat || doctor.locationDetails?.area || doctor.address) && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onViewMap) onViewMap(doctor);
              }}
              className="mt-2 text-xs sm:text-sm px-3 py-1.5 rounded-lg bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 transition-colors font-medium inline-flex items-center gap-1"
            >
              🗺️ View Location
            </button>
          )}
        </div>
        <div className="text-emerald-400 group-hover:translate-x-1 transition-transform flex-shrink-0 text-2xl">→</div>
      </div>
    </Card>
  );
}

export const DoctorSearch = ({ onSelectDoctor, setActiveTab, TABS, initialCity = "", initialArea = "" }) => {
  const [selectedCity, setSelectedCity] = useState(initialCity);
  const [selectedArea, setSelectedArea] = useState(initialArea);
  const [sortBy, setSortBy] = useState("rating");
  const [clinicType, setClinicType] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [availability, setAvailability] = useState("");
  const [acceptedInsurance, setAcceptedInsurance] = useState("");
  const [viewMode, setViewMode] = useState("list"); // 'list' | 'map'

  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");

  const availableAreas = selectedCity ? AREAS_BY_CITY[selectedCity] || [] : [];

  const handleViewDoctorOnMap = (doctor) => {
    setViewMode("map");
  };

  const handleSearch = async (city, area, sort, clinic, spec, avail, insur) => {
    if (!city) {
      setError("Please select a city");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const params = {
        city,
        ...(area && { area }),
        ...(sort && { sortBy: sort }),
        ...(clinic && { clinicType: clinic }),
        ...(spec && { specialization: spec }),
        ...(avail && { availability: avail }),
        ...(insur && { insurance: insur }),
      };

      const result = await fetchWithAuth(`/doctors/nearby?${new URLSearchParams(params).toString()}`);
      if (result.success) {
        setDoctors(result.data || []);
        setSearched(true);
      } else {
        setError(result.message || "Failed to fetch doctors");
        setDoctors([]);
      }
    } catch (err) {
      console.error("Search error:", err);
      setError("Failed to search doctors");
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    if (initialCity && !searched && isMounted) {
      handleSearch(initialCity, initialArea, sortBy, clinicType, specialization, availability, acceptedInsurance);
    }
    return () => { isMounted = false; };
  }, [initialCity, initialArea]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    handleSearch(selectedCity, selectedArea, sortBy, clinicType, specialization, availability, acceptedInsurance);
  };

  const handleSelectDoctor = (doctor) => {
    window.localStorage.setItem("medflow.selectedDoctor", JSON.stringify(doctor));
    if (onSelectDoctor) onSelectDoctor(doctor);
    if (setActiveTab && TABS) setActiveTab(TABS.BOOK || "book");
  };

  return (
    <div className="space-y-6">
      <SectionTitle title="Find Nearby Doctors" subtitle="Search doctors by location, specialization, clinic type and availability" />
      <Card className="p-6 transition-all duration-300">
        <form onSubmit={handleSearchSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-white">Select City *</label>
              <select value={selectedCity} onChange={(e) => { setSelectedCity(e.target.value); setSelectedArea(""); }} className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30">
                <option value="">Choose a city...</option>
                {CITIES.map((city) => <option key={city} value={city}>{city}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-white">Select Area (Optional)</label>
              <select value={selectedArea} onChange={(e) => setSelectedArea(e.target.value)} disabled={!selectedCity} className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 disabled:opacity-50">
                <option value="">All areas</option>
                {availableAreas.map((area) => <option key={area} value={area}>{area}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-white">Specialization (Optional)</label>
              <input type="text" value={specialization} onChange={(e) => setSpecialization(e.target.value)} placeholder="e.g., Cardiologist" className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30" />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-white">Clinic Type (Optional)</label>
              <select value={clinicType} onChange={(e) => setClinicType(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30">
                <option value="">All types</option>
                <option value="government">🏥 Government</option>
                <option value="private">🏢 Private</option>
              </select>
            </div>
            <div className="space-y-2 lg:col-span-1 sm:col-span-2">
              <label className="block text-sm font-semibold text-white">Accepted Insurance (Optional)</label>
              <select value={acceptedInsurance} onChange={(e) => setAcceptedInsurance(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30">
                <option value="">All Insurances</option>
                <option value="Medicare">Medicare</option>
                <option value="Medicaid">Medicaid</option>
                <option value="BlueCross">BlueCross</option>
                <option value="Aetna">Aetna</option>
                <option value="Cigna">Cigna</option>
                <option value="UnitedHealthcare">UnitedHealthcare</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-white">Availability (Optional)</label>
              <select value={availability} onChange={(e) => setAvailability(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30">
                <option value="">All</option>
                <option value="Available">✓ Available Now</option>
                <option value="Unavailable">✗ Unavailable</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-white">Sort By</label>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30">
                <option value="rating">⭐ Highest Rating</option>
                <option value="availability">✓ Availability</option>
                <option value="fee">💰 Lowest Fee</option>
                <option value="experience">👨‍⚕️ Most Experience</option>
              </select>
            </div>
          </div>
          {error && <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm font-medium">{error}</div>}
          
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="submit"
              disabled={loading || !selectedCity}
              className="flex-1 px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 transition-all duration-300 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 uppercase tracking-widest font-black flex items-center justify-center gap-2 transform active:scale-[0.98]"
            >
              {loading ? <><div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-950 border-t-transparent"></div>Searching...</> : <>🔍 Search Doctors</>}
            </button>
          </div>
        </form>
      </Card>

      {searched ? (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-500">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 backdrop-blur-sm">
            <h2 className="text-lg font-bold text-white tracking-wide">
              {doctors.length > 0 ? `Found ${doctors.length} doctor${doctors.length !== 1 ? "s" : ""} in your area` : "No doctors found"}
            </h2>
            {doctors.length > 0 && (
              <div className="flex items-center gap-3">
                <div className="flex bg-slate-900/80 p-1 rounded-lg border border-slate-700/50 shadow-inner">
                  <button onClick={() => setViewMode("list")} className={`px-4 py-1.5 rounded-md text-xs font-semibold tracking-wide transition-all duration-300 ${viewMode === "list" ? "bg-slate-700 text-white shadow-md" : "text-slate-400 hover:text-slate-200"}`}>List View</button>
                  <button onClick={() => setViewMode("map")} className={`px-4 py-1.5 rounded-md text-xs font-semibold tracking-wide transition-all duration-300 ${viewMode === "map" ? "bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]" : "text-slate-400 hover:text-slate-200"}`}>Map View</button>
                </div>
                <button onClick={() => { setSearched(false); setDoctors([]); }} className="text-xs font-semibold text-rose-400 hover:text-rose-300 transition px-3 py-1.5 rounded-lg hover:bg-rose-400/10">Clear Selection</button>
              </div>
            )}
          </div>
          {doctors.length > 0 ? (
            viewMode === "list" ? (
              <div className="grid grid-cols-1 gap-4">
                {doctors.map((doctor) => (
                  <DoctorCard key={doctor._id} doctor={doctor} onSelect={() => handleSelectDoctor(doctor)} onViewMap={() => handleViewDoctorOnMap(doctor)} />
                ))}
              </div>
            ) : (
              <MapView doctors={doctors} onSelectDoctor={handleSelectDoctor} />
            )
          ) : (
            <Card className="p-10 text-center border-dashed border-2 bg-slate-800/20">
              <div className="max-w-md mx-auto space-y-4">
                <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto shadow-inner"><span className="text-3xl">📭</span></div>
                <p className="text-xl font-bold text-slate-300 tracking-tight">No active doctors nearby</p>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">Try adjusting your location filters or expanding your search criteria to find available practitioners.</p>
              </div>
            </Card>
          )}
        </div>
      ) : null}
    </div>
  );
};
