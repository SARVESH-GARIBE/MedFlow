import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { fetchWithAuth } from "../services/api";
import { cn } from "../utils/helpers";
import { UserRound, MapPin, Star, Clock, AlertCircle, CheckCircle2, Building, ShieldCheck, Award } from "lucide-react";

const DoctorProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [doctor, setDoctor] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;
    const fetchDocData = async () => {
      try {
        setLoading(true);
        // GET DOCTOR DETAILS
        const res = await fetchWithAuth(`/doctors/${id}`);
        if (res.success && res.data) {
          if (isMounted) setDoctor(res.data);
          // GET REVIEWS
          const revRes = await fetchWithAuth(`/reviews/doctor/${id}`);
          if (revRes.success && isMounted) {
            setReviews(revRes.data || []);
          }
        } else {
          if (isMounted) setError("Doctor profile not found.");
        }
      } catch (err) {
        if (isMounted) setError("Failed to fetch doctor profile.");
        console.error(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchDocData();
    return () => { isMounted = false; };
  }, [id]);

  const handleBook = () => {
    if (doctor) {
      window.localStorage.setItem("medflow.selectedDoctor", JSON.stringify(doctor));
      navigate("/book");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white font-sans flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 animate-pulse">
            <div className="h-10 w-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-400 font-medium">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !doctor) {
    return (
      <div className="min-h-screen bg-slate-950 text-white font-sans flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="bg-rose-500/10 border border-rose-500/20 p-8 rounded-2xl max-w-md w-full text-center">
            <AlertCircle className="w-12 h-12 text-rose-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-rose-300 mb-2">Error</h2>
            <p className="text-rose-200/80 mb-6">{error || "Doctor not found"}</p>
            <button onClick={() => navigate("/find-doctors")} className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-colors font-semibold">
              ← Back to Search
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isAvailable = doctor.availability === "Available";
  
  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-emerald-500/30">
      <Navbar />
      
      <main className="max-w-5xl mx-auto px-4 py-8 sm:py-12 animate-in fade-in zoom-in-95 duration-500">
        
        {/* BACK BUTTON */}
        <button onClick={() => navigate(-1)} className="text-sm font-semibold text-slate-400 hover:text-emerald-400 transition flex items-center gap-2 mb-6">
          ← Back to Search Results
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* LEFT COLUMN: Main Info */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* HER0 CARD */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row gap-6 sm:gap-8 items-start relative overflow-hidden shadow-2xl backdrop-blur-sm">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
              
              <div className="shrink-0">
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 flex items-center justify-center p-1 shadow-inner">
                  {doctor.imageUrl ? (
                    <img src={doctor.imageUrl} alt={doctor.name} className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    <UserRound className="w-12 h-12 text-emerald-400/50" />
                  )}
                </div>
              </div>

              <div className="flex-1 w-full relative z-10">
                <div className="flex items-start justify-between gap-4 mb-2 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-1">
                    {doctor.name}
                  </h1>
                </div>

                <div className="flex items-center gap-3 text-emerald-400 font-bold tracking-wide mb-4">
                  <ShieldCheck className="w-5 h-5" />
                  <span>{doctor.specialization || "General Practitioner"}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6 text-sm font-medium text-slate-300">
                  <div className="flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="leading-tight">
                      {doctor.locationDetails?.area && `${doctor.locationDetails.area}, `}
                      <span className="text-white font-semibold">{doctor.locationDetails?.city || "Location Unspecified"}</span>
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2.5">
                    <Building className="w-4 h-4 text-cyan-500 shrink-0" />
                    <span>{doctor.clinicType === "government" ? "Government Facility" : "Private Practice"}</span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <Award className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>{doctor.experience ? `${doctor.experience} Years Experience` : "Expert Provider"}</span>
                  </div>
                  
                  <div className="flex items-center gap-2.5">
                    <Star className="w-4 h-4 text-yellow-400 shrink-0" />
                    <span className="flex items-center gap-1.5">
                      <span className="font-bold text-white">{(doctor.rating || 0).toFixed(1)}</span>
                      <span className="text-slate-500 text-xs">({doctor.reviewCount || 0} reviews)</span>
                    </span>
                  </div>
                </div>
                
                {doctor.qualifications && (
                  <div className="mt-5 pt-5 border-t border-slate-800/60 inline-flex items-center gap-2 px-3 py-1.5 bg-slate-800/40 rounded-lg border border-slate-700/50 text-xs font-semibold text-slate-300">
                    🎓 {doctor.qualifications}
                  </div>
                )}
              </div>
            </div>

            {/* ABOUT / REVIEWS SECTION */}
            <div className="space-y-6">
              <h3 className="text-lg font-bold uppercase tracking-widest text-slate-400 flex items-center gap-3 border-b border-slate-800 pb-3">
                <Star className="w-5 h-5 text-amber-500" /> Patient Feedback
              </h3>
              
              {reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review._id} className="bg-slate-900/30 border border-slate-800 p-5 rounded-2xl">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex text-amber-400 text-sm">
                          {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
                        </div>
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-800/50 px-2 py-0.5 rounded">
                          {new Date(review.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <p className="text-slate-300 leading-relaxed text-sm font-medium">"{review.comment}"</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 border-2 border-dashed border-slate-800 rounded-3xl text-center bg-slate-900/20">
                  <p className="text-slate-400 font-medium tracking-wide">No feedback available for this doctor yet.</p>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Sticky Booking Card */}
          <div className="lg:sticky lg:top-28">
            <div className="bg-slate-900/80 border border-slate-700 rounded-3xl p-6 shadow-2xl backdrop-blur-md">
              <div className="flex items-center justify-between mb-6 pb-6 border-b border-slate-800">
                <span className="text-sm font-black uppercase tracking-widest text-slate-400">Consultation Fee</span>
                <span className="text-3xl font-black text-emerald-400">₹{doctor.fee}</span>
              </div>

              <div className="space-y-4 mb-8">
                <div className={cn("p-4 rounded-xl border flex items-center gap-3", isAvailable ? "bg-emerald-500/10 border-emerald-500/20" : "bg-rose-500/10 border-rose-500/20")}>
                  {isAvailable ? <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" /> : <Clock className="w-5 h-5 text-rose-400 shrink-0" />}
                  <div>
                    <h4 className={cn("text-sm font-bold uppercase tracking-wider", isAvailable ? "text-emerald-300" : "text-rose-300")}>
                      {isAvailable ? "Available Today" : "Currently Unavailable"}
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5 font-medium">
                      {isAvailable ? "Accepting new appointments instantly" : "Fully booked or inactive"}
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-col gap-2 p-4 bg-slate-800/30 rounded-xl border border-slate-800 text-sm font-medium text-slate-300">
                  <div className="flex items-center gap-2">✓ Secure Digital Booking</div>
                  <div className="flex items-center gap-2">✓ Instant Confirmation</div>
                  <div className="flex items-center gap-2">✓ Reschedule Anytime</div>
                </div>
              </div>

              <button
                onClick={handleBook}
                className="w-full relative group inline-flex items-center justify-center p-4 px-6 font-black uppercase tracking-widest text-slate-900 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-xl overflow-hidden shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-all hover:shadow-[0_0_40px_rgba(16,185,129,0.5)] transform hover:-translate-y-1"
              >
                <div className="absolute inset-0 w-full h-full bg-white/20 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300"></div>
                <span className="relative z-10">Select & Book</span>
              </button>
            </div>
          </div>
          
        </div>
      </main>
    </div>
  );
};

export default DoctorProfile;
