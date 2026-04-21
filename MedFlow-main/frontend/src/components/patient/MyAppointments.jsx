import React, { useState } from "react";
import { formatDateTime, statusPill, cn } from "../../utils/helpers";
import { fetchWithAuth } from "../../services/api";
import { Star } from "lucide-react";
import jsPDF from "jspdf";
import "jspdf-autotable";

function Card({ children, className }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-800 bg-slate-800/30 shadow-[0_10px_30px_rgba(0,0,0,0.18)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

function SectionTitle({ title, subtitle, right }) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-white">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
        ) : null}
      </div>
      {right ? <div className="sm:pb-1">{right}</div> : null}
    </div>
  );
}

export const MyAppointments = ({ appointments }) => {
  const [reviewingAppt, setReviewingAppt] = useState(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Quick caching to see what was reviewed locally to prevent refetching immediately
  const [localReviewedIds, setLocalReviewedIds] = useState(new Set());

  // Prescription State
  const [viewRxAppt, setViewRxAppt] = useState(null);
  const [activeRx, setActiveRx] = useState(null);
  const [fetchingRx, setFetchingRx] = useState(false);

  const handleReviewClick = (appt) => {
    setReviewingAppt(appt);
    setRating(0);
    setComment("");
    setToastMessage("");
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      setToastMessage("Please select a star rating.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetchWithAuth("/reviews", {
        method: "POST",
        body: JSON.stringify({
          doctorId: reviewingAppt.doctor?._id || reviewingAppt.doctorId,
          appointmentId: reviewingAppt._id,
          rating,
          comment,
        }),
      });

      if (res.success) {
        setLocalReviewedIds((prev) => new Set(prev).add(reviewingAppt._id));
        setReviewingAppt(null);
      } else {
        setToastMessage(res.message || "Could not publish review.");
      }
    } catch (err) {
      setToastMessage("Network error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewPrescription = async (appt) => {
    setViewRxAppt(appt);
    setFetchingRx(true);
    setActiveRx(null);

    try {
      const res = await fetchWithAuth(`/prescriptions/appointment/${appt._id}`);
      if (res.success) {
        setActiveRx(res.data);
      } else {
        setToastMessage("Prescription not yet assigned by the doctor.");
      }
    } catch (err) {
      setToastMessage("Network error fetching clinical data.");
    } finally {
      setFetchingRx(false);
    }
  };

  const downloadPDF = () => {
    if (!activeRx) return;
    const doc = new jsPDF();

    doc.setFontSize(22);
    doc.setTextColor(59, 130, 246); // blue
    doc.text("MedFlow Digital Prescription", 14, 22);

    doc.setFontSize(11);
    doc.setTextColor(20, 20, 20);
    doc.text(`Doctor: Dr. ${activeRx.doctor?.name || "Clinician"}`, 14, 34);
    doc.text(`Patient: ${activeRx.patient?.name || "Patient"}`, 14, 40);
    doc.text(
      `Date Issued: ${new Date(activeRx.createdAt).toLocaleDateString()}`,
      14,
      46,
    );

    doc.autoTable({
      startY: 55,
      head: [["Medicine Name", "Dosage", "Frequency", "Route", "Duration"]],
      body: activeRx.medicines.map((m) => [
        m.name,
        m.dosage,
        m.frequency,
        m.route,
        m.duration,
      ]),
      theme: "grid",
      headStyles: { fillColor: [99, 102, 241] }, // indigo
    });

    const finalY = doc.lastAutoTable.finalY || 55;

    let currentY = finalY;
    if (activeRx.notes) {
      doc.text("Clinical Notes / Instructions:", 14, currentY + 15);
      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);
      const splitNotes = doc.splitTextToSize(activeRx.notes, 180);
      doc.text(splitNotes, 14, currentY + 22);
      currentY += 22 + splitNotes.length * 5;
    }

    // Footer Hash
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Doc version: v${activeRx.version || 1} | Integrity Hash: ${activeRx.prescriptionHash}`,
      14,
      285,
    );

    doc.save(`Prescription_${viewRxAppt._id.slice(-6)}.pdf`);
  };

  return (
    <div className="space-y-6 max-h-[90vh] overflow-y-auto pr-2 pb-20 custom-scrollbar">
      <SectionTitle
        title="My appointments"
        subtitle="Track your upcoming and past consultations and leave feedback."
      />

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-950/40 text-slate-300">
              <tr className="text-left">
                <th className="px-4 py-3 font-semibold">Doctor</th>
                <th className="px-4 py-3 font-semibold">Date</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {appointments.map((a) => {
                const canReview =
                  a.status !== "cancelled" && a.status !== "pending";
                const locallyReviewed = localReviewedIds.has(a._id);

                return (
                  <tr
                    key={a._id}
                    className="text-slate-200 hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="px-4 py-4">
                      <div className="font-semibold text-white">
                        {a.doctor?.name || "—"}
                      </div>
                      <div className="mt-0.5 text-xs text-slate-400">
                        {a.doctor?.specialization || "General"}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-slate-300">
                      <div className="font-medium text-slate-200">
                        {formatDateTime(a.appointmentDate)}
                      </div>
                      <div className="mt-0.5 text-xs text-slate-400">
                        {a.timeSlot}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
                          statusPill(a.status),
                        )}
                      >
                        {String(a.status || "pending").toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      {locallyReviewed ? (
                        <span className="text-xs text-emerald-400 font-semibold px-2">
                          Reviewed ✓
                        </span>
                      ) : canReview ? (
                        <button
                          onClick={() => handleReviewClick(a)}
                          className="px-3 py-1.5 text-xs font-semibold text-emerald-300 bg-emerald-400/10 border border-emerald-400/20 rounded-lg hover:bg-emerald-400/20 transition-colors"
                        >
                          Review
                        </button>
                      ) : (
                        <span className="text-xs text-slate-600 font-medium px-2">
                          N/A
                        </span>
                      )}

                      {a.status === "completed" && (
                        <button
                          onClick={() => handleViewPrescription(a)}
                          className="ml-2 px-3 py-1.5 text-xs font-semibold text-indigo-300 bg-indigo-500/10 border border-indigo-500/30 rounded-lg hover:bg-indigo-500/20 transition-colors shadow-[0_0_10px_rgba(99,102,241,0.1)]"
                        >
                          View Prescription
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {appointments.length === 0 ? (
                <tr>
                  <td
                    className="px-4 py-8 text-center text-slate-400"
                    colSpan={4}
                  >
                    No appointments found. Head to the Book tab to schedule one.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Embedded Review Overlay Form */}
      {reviewingAppt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-sm shadow-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-2">
              Review Consultation
            </h3>
            <p className="text-sm text-slate-400 mb-6">
              How was your experience with {reviewingAppt.doctor?.name}?
            </p>

            <form onSubmit={submitReview}>
              <div className="flex justify-center gap-2 mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="focus:outline-none transition-transform hover:scale-110"
                  >
                    <Star
                      className={cn(
                        "w-8 h-8",
                        (hoverRating || rating) >= star
                          ? "fill-amber-400 text-amber-400"
                          : "fill-slate-800 text-slate-600",
                      )}
                    />
                  </button>
                ))}
              </div>

              <textarea
                className="w-full rounded-xl border border-slate-700 bg-slate-800/50 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/40 mb-4 h-24 resize-none"
                placeholder="Share your experience (optional)..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />

              {toastMessage && (
                <div className="mb-4 text-xs font-semibold text-rose-400 text-center">
                  {toastMessage}
                </div>
              )}

              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setReviewingAppt(null)}
                  className="px-4 py-2 text-sm font-semibold text-slate-300 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || rating === 0}
                  className="px-5 py-2 rounded-xl text-sm font-semibold bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : "Submit Review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Embedded Prescription Overlay */}
      {viewRxAppt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-800/60 bg-slate-900/50 flex justify-between items-center shrink-0">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Clinical Prescription
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Consultation with {viewRxAppt.doctor?.name}
                </p>
              </div>
              <button
                onClick={() => {
                  setViewRxAppt(null);
                  setToastMessage("");
                  setActiveRx(null);
                }}
                className="text-slate-500 hover:text-white transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </button>
            </div>

            <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar relative">
              {fetchingRx ? (
                <div className="flex justify-center items-center py-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                </div>
              ) : activeRx ? (
                <div className="space-y-6">
                  <div className="bg-indigo-500/5 border border-indigo-500/10 p-4 rounded-2xl flex justify-between items-center">
                    <div>
                      <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-1">
                        Prescribed On
                      </p>
                      <p className="text-sm text-slate-200">
                        {new Date(activeRx.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-1">
                        Patient
                      </p>
                      <p className="text-sm text-slate-200">
                        {activeRx.patient?.name}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-slate-300 mb-3 uppercase tracking-wider">
                      Medicines Dispensed
                    </h3>
                    <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950/30">
                      <table className="min-w-full text-sm text-left">
                        <thead className="bg-slate-900/80 text-slate-400">
                          <tr>
                            <th className="px-4 py-3 font-semibold">
                              Medicine
                            </th>
                            <th className="px-4 py-3 font-semibold">Dosage</th>
                            <th className="px-4 py-3 font-semibold hidden sm:table-cell">
                              Route
                            </th>
                            <th className="px-4 py-3 font-semibold">
                              Frequency
                            </th>
                            <th className="px-4 py-3 font-semibold">
                              Duration
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                          {activeRx.medicines.map((m, i) => (
                            <tr key={i} className="text-slate-300">
                              <td className="px-4 py-3">
                                <div className="font-medium text-white">
                                  {m.name}
                                </div>
                                {m.instructions && (
                                  <div className="text-[10px] text-slate-500 mt-0.5">
                                    {m.instructions}
                                  </div>
                                )}
                              </td>
                              <td className="px-4 py-3 text-slate-400">
                                {m.dosage}
                              </td>
                              <td className="px-4 py-3 text-slate-400 hidden sm:table-cell">
                                {m.route}
                              </td>
                              <td className="px-4 py-3 text-slate-400">
                                {m.frequency}
                              </td>
                              <td className="px-4 py-3">{m.duration}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {activeRx.notes && (
                    <div>
                      <h3 className="text-sm font-semibold text-slate-300 mb-2 uppercase tracking-wider">
                        Clinical Notes
                      </h3>
                      <p className="text-sm text-slate-400 leading-relaxed bg-slate-900/40 p-4 rounded-xl border border-slate-800/60 whitespace-pre-wrap">
                        {activeRx.notes}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-10 text-center text-slate-400 text-sm">
                  {toastMessage ||
                    "No prescription available. Check back later."}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-slate-800 bg-slate-950 shadow-inner flex flex-col sm:flex-row justify-between items-center shrink-0 rounded-b-3xl gap-4">
              <div>
                <p className="text-[10px] text-slate-500 font-mono tracking-wider">
                  v{activeRx.version || 1} • HASH:{" "}
                  {activeRx.prescriptionHash?.substring(0, 16)}...
                </p>
                <p className="text-[10px] text-slate-600">
                  Official MedFlow Encrypted Record
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setViewRxAppt(null);
                    setToastMessage("");
                    setActiveRx(null);
                  }}
                  className="px-5 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-sm font-semibold text-white hover:bg-slate-700 transition-colors"
                >
                  Close
                </button>
                {activeRx && (
                  <button
                    onClick={downloadPDF}
                    className="px-5 py-2.5 rounded-xl border border-indigo-500/50 bg-indigo-500/20 text-indigo-300 text-sm font-semibold hover:bg-indigo-500 hover:text-white transition-all shadow-[0_0_15px_rgba(99,102,241,0.2)] flex items-center gap-2"
                  >
                    Download PDF
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      ></path>
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
