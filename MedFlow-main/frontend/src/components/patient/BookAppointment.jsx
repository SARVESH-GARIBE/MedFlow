import React, { useState, useMemo, useEffect } from "react";
import { fetchWithAuth } from "../../services/api";
import { cn, formatDateTime } from "../../utils/helpers";

function Card({ children, className }) {
  return (
    <div className={cn("rounded-2xl border border-slate-800 bg-slate-800/30 shadow-[0_10px_30px_rgba(0,0,0,0.18)] transition-all", className)}>
      {children}
    </div>
  );
}

function SectionTitle({ title, subtitle, right }) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between mb-2">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-300">{title}</h1>
        {subtitle ? <p className="mt-1 text-sm text-slate-400 font-medium">{subtitle}</p> : null}
      </div>
      {right ? <div className="sm:pb-1">{right}</div> : null}
    </div>
  );
}

const FALLBACK_SLOTS = ["09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "04:00 PM", "04:30 PM", "05:00 PM"];

export const BookAppointment = ({ doctors, appointments, refreshData, setToast, TABS, setActiveTab, user }) => {
  const departments = useMemo(() => Array.from(new Set(doctors.map((d) => d.specialization).filter(Boolean))), [doctors]);

  const cachedDocData = window.localStorage.getItem("medflow.selectedDoctor");
  let cachedDoctorId = "";
  try {
    if (cachedDocData) {
      const parsed = JSON.parse(cachedDocData);
      cachedDoctorId = parsed?._id || parsed?.id || "";
    }
  } catch (e) {
    // Silently ignore parse errors and use default
    cachedDoctorId = "";
  }

  const [bookingMode, setBookingMode] = useState("manual"); // 'manual' | 'smart'
  const [doctorId, setDoctorId] = useState(cachedDoctorId || doctors[0]?._id || "");
  const [department, setDepartment] = useState("");
  const [date, setDate] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() + 1); return d.toISOString().slice(0, 10);
  });
  const [timeSlot, setTimeSlot] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [urgency, setUrgency] = useState("Routine");
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState("");

  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [aiRecommendedDoctor, setAiRecommendedDoctor] = useState(null);

  const [reviews, setReviews] = useState([]);
  const [viewingReviews, setViewingReviews] = useState(false);

  const resolvedDoctor = useMemo(() => doctors.find((d) => d._id === doctorId), [doctors, doctorId]);

  useEffect(() => {
    if (resolvedDoctor?.specialization) setDepartment(resolvedDoctor.specialization);
    setViewingReviews(false);
    if (resolvedDoctor?._id) {
      const fetchReviews = async () => {
        try {
          const res = await fetchWithAuth(`/reviews/doctor/${resolvedDoctor._id}`, { method: "GET" });
          setReviews(res?.success ? res.data : []);
        } catch (e) { setReviews([]); }
      };
      fetchReviews();
    }
  }, [resolvedDoctor]);

  const [bookedSlots, setBookedSlots] = useState([]);

  useEffect(() => {
    if (!doctorId || !date) return;
    const fetchSlots = async () => {
      try {
        const res = await fetchWithAuth(`/appointments/booked-slots/${doctorId}/${date}`);
        setBookedSlots(res.success ? res.data : []);
      } catch (err) { console.error("Failed to fetch booked slots", err); }
    };
    fetchSlots();
  }, [doctorId, date]);

  // AI AUTO BOOKING SYSTEM LOGIC
  useEffect(() => {
    if (!symptoms.trim() || symptoms.trim().length < 5) {
      setAiSuggestion(null); setAiRecommendedDoctor(null); return;
    }

    const analyzeAndSelect = async () => {
      setAnalyzing(true);
      try {
        const aiRes = await fetchWithAuth("/ai/recommend", { method: "POST", body: JSON.stringify({ symptoms }) });

        if (aiRes.success && aiRes.recommendedSpecialization) {
          const spec = aiRes.recommendedSpecialization;
          const prio = aiRes.priority;

          setAiSuggestion({ specialization: spec, priority: prio });

          if (spec !== "General Physician" && departments.includes(spec)) {
            setDepartment(spec);
          }
          if (prio === "HIGH") setUrgency("Emergency");
          else if (prio === "MEDIUM") setUrgency("Urgent");
          else setUrgency("Routine");

          if (bookingMode === "smart") {
            const userCity = user?.locationDetails?.city || "Mumbai";
            const docRes = await fetchWithAuth(`/doctors/nearby?city=${encodeURIComponent(userCity)}&specialization=${encodeURIComponent(spec === "General Physician" ? "" : spec)}&availability=Available&sortBy=rating`);

            if (docRes.success && docRes.data?.length > 0) {
              const bestDoctor = docRes.data[0];
              setAiRecommendedDoctor(bestDoctor);
              setDoctorId(bestDoctor._id);
            } else {
              const localBestDoctor = doctors.filter(d => d.availability === "Available" && (spec === "General Physician" || d.specialization?.includes(spec))).sort((a, b) => (b.rating || 0) - (a.rating || 0))[0];
              if (localBestDoctor) {
                setAiRecommendedDoctor(localBestDoctor);
                setDoctorId(localBestDoctor._id);
              } else {
                setAiRecommendedDoctor(null);
              }
            }
          }
        }
      } catch (err) { console.error("AI booking system error:", err); } finally { setAnalyzing(false); }
    };

    const handler = setTimeout(analyzeAndSelect, 1500);
    return () => clearTimeout(handler);
  }, [symptoms, departments, bookingMode, doctors, user]);

  const availableSlots = useMemo(() => {
    if (!doctorId) return FALLBACK_SLOTS;
    return FALLBACK_SLOTS.filter((s) => !bookedSlots.includes(s));
  }, [doctorId, bookedSlots]);

  useEffect(() => {
    if (availableSlots.length > 0) {
      if (!availableSlots.includes(timeSlot)) setTimeSlot(availableSlots[0]);
    } else {
      setTimeSlot("");
    }
  }, [availableSlots, timeSlot]);

  const submit = async (e) => {
    e.preventDefault();
    setNotice(""); setSubmitting(true);

    if (!doctorId || !date || !timeSlot) {
      setNotice("Please fill out all fields."); setSubmitting(false); return;
    }

    try {
      const payload = {
        patient: user?.id || user?._id, doctor: doctorId,
        department: department || resolvedDoctor?.specialization || "General",
        appointmentDate: date, timeSlot: timeSlot, symptoms: symptoms, urgency: urgency,
      };

      const res = await fetchWithAuth("/appointments", { method: "POST", body: JSON.stringify(payload) });

      if (res.success) {
        setToast("✅ Appointment booked! Processing secure payment..."); refreshData();
        window.localStorage.removeItem("medflow.selectedDoctor");

        const appointmentId = res.data?._id || res.data?.id;

        try {
          const orderData = await fetchWithAuth("/payments/create-order", { method: "POST", body: JSON.stringify({ appointmentId }) });
          if (!orderData?.success) throw new Error(orderData.message);

          const orderId = orderData.order_id || orderData.orderId;
          const amountInRupees = orderData.amountInRupees || (orderData.amount ? orderData.amount / 100 : 0);
          setToast(`💰 Processing payment of ₹${amountInRupees}...`);
          
          await new Promise(r => setTimeout(r, 1200));

          const verifyData = await fetchWithAuth("/payments/verify", { method: "POST", body: JSON.stringify({ orderId, appointmentId }) });
          if (verifyData?.success) {
            setToast("✅ Smart Payment successful! Appointment confirmed."); refreshData();
            if(setActiveTab) setActiveTab(TABS.PAYMENTS || "payments");
          } else {
            setToast("❌ Payment verification failed.");
            if(setActiveTab) setActiveTab(TABS.PAYMENTS || "payments");
          }
        } catch (paymentErr) {
          setToast(`❌ Payment error. Please retry from dashboard.`);
          if(setActiveTab) setActiveTab(TABS.PAYMENTS || "payments");
        }
      } else {
        setNotice(res.message || "Failed to book appointment.");
      }
    } catch (err) { setNotice(err.message || "Something went wrong."); } finally { setSubmitting(false); }
  };

  const inputBase = "w-full rounded-xl border border-slate-700 bg-slate-900/40 px-4 py-3 text-sm font-medium text-white outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/40 transition-colors shadow-inner placeholder-slate-500";

  return (
    <div className="space-y-6 max-h-[90vh] overflow-y-auto pr-2 pb-20 custom-scrollbar animate-in fade-in zoom-in-95 duration-300">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-800/20 p-4 rounded-2xl border border-slate-700/50 backdrop-blur-sm">
        <SectionTitle title="Book Appointment" subtitle="Schedule a visit using our advanced AI-driven system." />
        <div className="flex bg-slate-900/60 p-1 rounded-xl border border-slate-700 shadow-inner shrink-0">
          <button type="button" onClick={() => setBookingMode("manual")} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-300 ${bookingMode === "manual" ? "bg-slate-700 text-white shadow-md transform scale-100" : "text-slate-400 hover:text-slate-300 scale-95"}`}>Manual Booking</button>
          <button type="button" onClick={() => setBookingMode("smart")} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-300 flex items-center gap-1.5 ${bookingMode === "smart" ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.4)] transform scale-100" : "text-slate-400 hover:text-indigo-300 scale-95"}`}><span className="text-[14px]">✨</span> AI Smart Booking</button>
        </div>
      </div>

      <Card className="p-5 sm:p-8">
        <form onSubmit={submit} className="grid gap-6 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-2 block text-xs font-bold text-slate-300 tracking-wide uppercase">
              Describe Symptoms <span className="text-emerald-400 hover:underline cursor-help" title="Our AI automatically analyzes symptoms to recommend and pick the best doctor for you.">(?)</span>
            </label>
            <textarea value={symptoms} onChange={(e) => setSymptoms(e.target.value)} placeholder="e.g. 'Severe chest pain radiating to left arm along with shortness of breath...'" className={inputBase + " h-24 resize-y leading-relaxed"} style={bookingMode === "smart" ? { border: "1px solid rgba(99,102,241,0.4)" } : {}} />
          </div>

          {analyzing && (
            <div className="sm:col-span-2 animate-in fade-in slide-in-from-top-2">
              <div className="p-4 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/30 rounded-xl flex items-center gap-4 shadow-inner">
                <div className="h-5 w-5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin shrink-0"></div>
                <div className="flex-1">
                  <div className="text-xs font-bold text-indigo-300 uppercase tracking-widest">AI Analysis Engine Active</div>
                  <div className="text-[11px] font-medium text-slate-400 mt-0.5">Analyzing clinical parameters & scanning nearby top-rated specialists...</div>
                </div>
              </div>
            </div>
          )}

          {aiSuggestion && !analyzing && bookingMode === "smart" && (
            <div className="sm:col-span-2 animate-in fade-in zoom-in-95 duration-500">
              <div className="bg-slate-900 border border-slate-700/60 rounded-2xl overflow-hidden shadow-2xl relative group">
                {/* Header Strip based on Priority */}
                <div className={cn("h-1.5 w-full",
                  aiSuggestion.priority === "HIGH" ? "bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.5)]" :
                  aiSuggestion.priority === "MEDIUM" ? "bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)]" :
                  "bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                )}></div>

                <div className="p-5 sm:p-7 relative z-10 flex flex-col md:flex-row gap-6 items-start">
                  
                  {/* Left Column: AI Reasoning */}
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                       <span className="text-xl">🤖</span>
                       <h3 className="font-black text-slate-200 tracking-wide uppercase text-sm">AI Recommendation</h3>
                    </div>

                    <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                      <p className="text-xs uppercase font-bold tracking-widest text-slate-500 mb-1">Recommended Specialist</p>
                      <p className="text-lg font-bold text-white mb-4">{aiSuggestion.specialization}</p>

                      <p className="text-xs uppercase font-bold tracking-widest text-slate-500 mb-1">Triage Priority</p>
                      <div className="inline-flex mt-1">
                          <span className={cn("px-3 py-1 rounded-lg text-xs font-black uppercase tracking-widest shadow-lg",
                              aiSuggestion.priority === "HIGH" ? "bg-rose-500/20 text-rose-400 border border-rose-500/50" :
                              aiSuggestion.priority === "MEDIUM" ? "bg-amber-500/20 text-amber-400 border border-amber-500/50" :
                              "bg-emerald-500/20 text-emerald-400 border border-emerald-500/50"
                          )}>
                              {aiSuggestion.priority === "HIGH" ? "🚨 High Severity" :
                               aiSuggestion.priority === "MEDIUM" ? "⚠️ Medium Severity" : "✓ Low Severity"}
                          </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Suggested Doctor */}
                  <div className="w-full md:w-5/12 shrink-0 border-t md:border-t-0 md:border-l border-slate-700/50 pt-5 md:pt-0 md:pl-6 flex flex-col justify-between">
                    <div>
                      <p className="text-xs uppercase font-bold tracking-widest text-emerald-400 mb-3 flex items-center gap-2">✓ Best Match Found</p>
                      {aiRecommendedDoctor ? (
                        <div className="space-y-3">
                          <div className="flex justify-between items-start gap-3">
                            <div>
                               <p className="text-base font-bold text-white leading-tight">{aiRecommendedDoctor.name}</p>
                               <p className="text-xs text-slate-400 mt-1">{aiRecommendedDoctor.specialization}</p>
                               <p className="text-xs font-semibold text-slate-500 mt-1">⭐ {(aiRecommendedDoctor.rating || 0).toFixed(1)} / 5.0</p>
                            </div>
                            <div className="bg-slate-800 p-2 rounded-lg text-center min-w-16 border border-slate-700 shadow-inner">
                                <p className="text-[10px] uppercase font-bold text-slate-400">Fee</p>
                                <p className="text-sm font-black text-emerald-400">₹{aiRecommendedDoctor.fee}</p>
                            </div>
                          </div>
                          
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              if(aiRecommendedDoctor) setDoctorId(aiRecommendedDoctor._id);
                              // Smooth scroll down to date picker
                              window.scrollBy({ top: 400, behavior: 'smooth' });
                            }}
                            className="w-full mt-2 bg-gradient-to-r from-emerald-500 to-emerald-400 text-slate-950 px-4 py-2.5 rounded-xl font-bold text-sm tracking-wide shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] transition-all flex items-center justify-center gap-2"
                          >
                            Select & Continue
                          </button>
                        </div>
                      ) : (
                        <div className="bg-slate-800/50 p-4 rounded-xl text-center border border-slate-700 border-dashed">
                          <span className="text-2xl mb-2 block">🤷</span>
                          <p className="text-xs font-semibold text-slate-400 leading-relaxed">No specialists matching this profile are currently available in your proximity.</p>
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            </div>
          )}

          <div className="sm:col-span-2">
            <label className="mb-2 block text-xs font-bold text-slate-300 tracking-wide uppercase">Doctor Selection</label>
            <select value={doctorId} onChange={(e) => setDoctorId(e.target.value)} className={inputBase} required>
              <option value="" disabled>Select a Doctor manually...</option>
              {doctors.map((d) => <option key={d._id} value={d._id}>{d.clinicType === "government" ? "🏥" : "🏢"} {d.name} — {d.specialization} {d.availability !== "Available" ? "(Unavailable)" : ""}{d.rating ? ` [⭐${d.rating.toFixed(1)}]` : ""}</option>)}
            </select>
            
            {resolvedDoctor ? (
              <div className="mt-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 transition-all hover:bg-emerald-500/10">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="text-[15px] font-bold text-emerald-100 tracking-wide">{resolvedDoctor.name}</div>
                    <span className="text-sm px-2 py-0.5 bg-slate-800 rounded-md border border-slate-700 text-slate-300">{resolvedDoctor.clinicType === "government" ? "🏥 Govt" : "🏢 Private"}</span>
                  </div>
                  <div className="mt-1 text-xs font-medium text-emerald-300/80">{resolvedDoctor.specialization || "General"}</div>
                  {resolvedDoctor.locationDetails?.city && (
                    <div className="mt-1.5 text-[11px] font-medium text-slate-400">
                      📍 {resolvedDoctor.locationDetails.area && `${resolvedDoctor.locationDetails.area}, `}
                      <span className="text-emerald-200">{resolvedDoctor.locationDetails.city}</span>
                    </div>
                  )}
                  <button type="button" className="mt-2 text-[11px] font-bold text-amber-400 hover:text-amber-300 transition-colors focus:outline-none flex items-center bg-amber-400/10 px-2 py-1 rounded" onClick={() => setViewingReviews(!viewingReviews)}>
                    Read Reviews ★ {resolvedDoctor.rating || 0} ({resolvedDoctor.reviewCount || 0})
                  </button>
                </div>
                <div className="sm:text-right bg-slate-900/50 p-3 rounded-lg border border-slate-700/50 shrink-0">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Consultation Fee</div>
                  <div className="font-black text-xl text-emerald-400 mt-0.5">₹{resolvedDoctor.fee}</div>
                </div>
              </div>
            ) : null}

            {viewingReviews && resolvedDoctor && (
              <div className="mt-3 bg-slate-900/60 p-5 rounded-xl border border-slate-700/60 max-h-56 overflow-y-auto custom-scrollbar shadow-inner animate-in slide-in-from-top-2">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"><span className="w-4 h-0.5 bg-slate-600 rounded"></span> PATIENT FEEDBACK</h4>
                {reviews.length === 0 ? <p className="text-xs text-slate-500 italic p-4 text-center bg-slate-800/20 rounded-lg">No reviews written for this doctor yet.</p> : (
                  <div className="space-y-4">
                    {reviews.map((r) => (
                      <div key={r._id} className="border-b border-slate-700/50 pb-4 last:border-0 last:pb-0">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="flex text-amber-400 text-xs tracking-widest drop-shadow">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</div>
                          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{formatDateTime(r.createdAt)}</span>
                        </div>
                        {r.comment && <p className="text-xs text-slate-300 leading-relaxed font-medium bg-slate-800/30 p-2.5 rounded-lg border border-slate-700/50">"{r.comment}"</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold text-slate-300 tracking-wide uppercase">Department</label>
            <select value={department} onChange={(e) => setDepartment(e.target.value)} className={inputBase} required>
              <option value="" disabled>Select department</option>
              {departments.map((dep) => <option key={dep} value={dep}>{dep}</option>)}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold text-slate-300 tracking-wide uppercase">Schedule Date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputBase + " uppercase tracking-wider"} min={new Date().toISOString().slice(0, 10)} required />
          </div>

          <div className="sm:col-span-2">
            <label className="mb-3 block text-xs font-bold text-slate-300 tracking-wide uppercase">Available Time slots</label>
            <div className="grid gap-2 grid-cols-2 sm:grid-cols-4 lg:grid-cols-6">
              {availableSlots.map((slot) => {
                const active = slot === timeSlot;
                return (
                  <button key={slot} type="button" onClick={() => setTimeSlot(slot)} className={cn("rounded-xl px-3 py-3 text-xs font-bold border transition-all text-center tracking-wide", active ? "border-emerald-400 bg-emerald-500/20 text-emerald-300 ring-2 ring-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.2)] transform scale-105 z-10" : "border-slate-700 bg-slate-800/50 text-slate-400 hover:bg-slate-700 hover:text-white hover:border-slate-500")}>{slot}</button>
                );
              })}
            </div>
            {availableSlots.length === 0 && <div className="mt-4 p-3 rounded-lg border border-amber-500/30 bg-amber-500/10 text-xs text-amber-300 font-bold flex items-center justify-center gap-2"><span>⚠️</span> No slots available on this date. The doctor is fully booked.</div>}
          </div>

          <div className="sm:col-span-2">
            <label className="mb-2 block text-xs font-bold text-slate-300 tracking-wide uppercase">Urgency Level</label>
            <select value={urgency} onChange={(e) => setUrgency(e.target.value)} className={cn(inputBase, "font-bold", urgency === "Emergency" && "text-rose-400 border-rose-500/50 bg-rose-500/5", urgency === "Urgent" && "text-amber-400 border-amber-500/50 bg-amber-500/5")}>
              <option value="Routine" className="text-slate-900 font-bold">✓ Routine Checkup (Standard priority)</option>
              <option value="Urgent" className="text-slate-900 font-bold">⚠️ Urgent (Require medical attention soon)</option>
              <option value="Emergency" className="text-slate-900 font-bold">🚨 Emergency (Immediate critical attention)</option>
            </select>
          </div>

          <div className="sm:col-span-2 mt-4 pt-6 border-t border-slate-700/50 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-5">
            <div className="text-[11px] font-medium text-slate-400 leading-relaxed max-w-sm">
              <span className="text-emerald-400 font-bold">Secure Booking.</span> Confirmation depends on doctor availability. Automatic routing to secure payment gateway upon confirmation.
            </div>
            <button type="submit" disabled={submitting || !doctorId || !date || !timeSlot} className="relative rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 text-white px-8 py-3.5 text-sm font-black tracking-wide uppercase shadow-[0_5px_20px_rgba(16,185,129,0.3)] hover:shadow-[0_8px_30px_rgba(16,185,129,0.4)] disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:-translate-y-0.5 active:translate-y-0 overflow-hidden group">
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out"></div>
              <span className="relative flex items-center justify-center gap-2">
                {submitting ? <><div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Authorizing...</> : <>✓ Confirm Appointment</>}
              </span>
            </button>
          </div>

          {notice && (
            <div className="sm:col-span-2 rounded-xl border border-rose-500/40 bg-rose-500/10 px-5 py-4 flex items-center gap-3 animate-in shake">
              <div className="h-8 w-8 rounded-full bg-rose-500/20 flex items-center justify-center shrink-0"><span className="text-rose-400 font-bold text-lg">!</span></div>
              <p className="text-sm font-bold text-rose-300 tracking-wide">{notice}</p>
            </div>
          )}
        </form>
      </Card>
    </div>
  );
};
