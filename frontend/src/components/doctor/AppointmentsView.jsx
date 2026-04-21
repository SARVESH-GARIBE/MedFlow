import React, { useState } from "react";
import { cn, statusPill } from "../../utils/helpers";
import { fetchWithAuth } from "../../services/api";

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

function isToday(dateLike) {
  const d = new Date(dateLike);
  if (Number.isNaN(d.getTime())) return false;
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

function isUpcoming(dateLike) {
  const d = new Date(dateLike);
  if (Number.isNaN(d.getTime())) return false;
  return d.getTime() > Date.now();
}

function priorityBadge(level) {
  if (level === "High")
    return "bg-rose-500/15 text-rose-300 ring-1 ring-rose-500/50 shadow-[0_0_10px_rgba(244,63,94,0.2)]";
  if (level === "Medium")
    return "bg-amber-500/10 text-amber-300 ring-1 ring-amber-500/30";
  return "bg-slate-500/10 text-slate-300 ring-1 ring-slate-500/30";
}

export const AppointmentsView = ({ appointments, refreshData, setToast }) => {
  const [filter, setFilter] = useState("today");
  const [processingId, setProcessingId] = useState("");

  // RX State
  const [rxAppt, setRxAppt] = useState(null);
  const [medicines, setMedicines] = useState([
    {
      name: "",
      dosage: "",
      frequency: "",
      duration: "",
      route: "",
      instructions: "",
    },
  ]);
  const [rxNotes, setRxNotes] = useState("");
  const [savingRx, setSavingRx] = useState(false);

  const filtered = appointments
    .filter((a) => {
      if (filter === "today") return isToday(a.appointmentDate);
      if (filter === "upcoming")
        return isUpcoming(a.appointmentDate) && a.status !== "completed";
      if (filter === "completed") return a.status === "completed";
      return true;
    })
    .sort((a, b) => {
      const triageDiff = (b.priorityScore || 0) - (a.priorityScore || 0);
      if (triageDiff !== 0) return triageDiff;
      return new Date(a.appointmentDate) - new Date(b.appointmentDate);
    });

  const nextStatus = (s) => {
    if (s === "pending") return "confirmed";
    if (s === "confirmed") return "completed";
    return "completed";
  };

  const onSetStatus = async (id, status) => {
    setProcessingId(id);
    try {
      const res = await fetchWithAuth(`/appointments/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      if (res.success) {
        const statusText =
          status === "completed" ? "Completed ✅" : "Confirmed";
        setToast(`Appointment marked as ${statusText}`);
        refreshData();
      } else {
        setToast(res.message || "Failed to update appointment.");
      }
    } catch (err) {
      setToast(err.message || "Something went wrong tracking status.");
    } finally {
      setProcessingId("");
    }
  };

  const updateMedicine = (idx, field, val) => {
    const newMeds = [...medicines];
    newMeds[idx][field] = val;
    setMedicines(newMeds);
  };

  const handleSaveRx = async (e) => {
    e.preventDefault();
    setSavingRx(true);

    const validMeds = medicines.filter((m) => m.name.trim() !== "");
    if (validMeds.length === 0) {
      setToast("Add at least one medicine before submitting.");
      setSavingRx(false);
      return;
    }

    try {
      const res = await fetchWithAuth("/prescriptions", {
        method: "POST",
        body: JSON.stringify({
          appointmentId: rxAppt._id,
          medicines: validMeds,
          notes: rxNotes,
        }),
      });

      if (res.success) {
        setToast("✅ Digital prescription finalized successfully!");
        setRxAppt(null); // close it
        refreshData(); // Refresh appointments to show prescription was added
      } else {
        setToast(res.message || "Failed to write prescription.");
      }
    } catch (err) {
      setToast("❌ Network error creating prescription.");
    } finally {
      setSavingRx(false);
    }
  };

  return (
    <div className="space-y-6 max-h-[90vh] overflow-y-auto pr-2 pb-20 custom-scrollbar relative">
      <SectionTitle
        title="My Appointments"
        subtitle="Manage your consultation queue and update status."
        right={
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-2.5 text-sm text-white outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50"
          >
            <option value="today">Today</option>
            <option value="upcoming">Upcoming</option>
            <option value="completed">Completed</option>
            <option value="all">All</option>
          </select>
        }
      />

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm flex-1">
            <thead className="bg-slate-950/40 text-slate-300">
              <tr className="text-left">
                <th className="px-4 py-4 font-semibold">Patient</th>
                <th className="px-4 py-4 font-semibold">When</th>
                <th className="px-4 py-4 font-semibold">Status</th>
                <th className="px-4 py-4 font-semibold w-56">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filtered.map((a) => (
                <tr
                  key={a._id}
                  className="text-slate-200 hover:bg-slate-800/40 transition-colors align-top"
                >
                  <td className="px-4 py-4 w-1/3">
                    <div className="font-semibold text-white">
                      {a.patient?.name || "Patient"}
                    </div>
                    <div className="mt-1 text-xs text-slate-400">
                      {a.patient?.email || "—"}
                    </div>

                    <div className="mt-2.5 flex items-center gap-2">
                      <span
                        className={cn(
                          "inline-flex rounded text-[9px] uppercase font-bold tracking-widest px-1.5 py-0.5 whitespace-nowrap",
                          priorityBadge(a.priorityLevel || "Routine"),
                        )}
                      >
                        {a.priorityLevel || "Routine"} Priority
                      </span>
                      {a.urgency && (
                        <span className="text-[9px] text-slate-500 uppercase tracking-wider hidden xl:inline-block">
                          ({a.urgency})
                        </span>
                      )}
                    </div>

                    {a.symptoms && (
                      <div className="mt-2 text-[11px] text-slate-300 bg-slate-800/50 p-2.5 rounded-lg border border-slate-700/50 leading-relaxed max-w-sm">
                        <span className="font-semibold text-white">
                          Symptoms:{" "}
                        </span>
                        {a.symptoms}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-4 text-slate-300">
                    <div className="font-medium text-slate-50">
                      {a.appointmentDate
                        ? new Date(a.appointmentDate).toLocaleDateString(
                            undefined,
                            {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                            },
                          )
                        : "—"}
                    </div>
                    <div className="mt-1 text-xs text-slate-400">
                      {a.timeSlot || "—"}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
                          statusPill(a.status),
                        )}
                      >
                        {String(a.status || "pending")
                          .replaceAll("_", " ")
                          .toUpperCase()}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-col gap-2">
                      <button
                        type="button"
                        onClick={() => onSetStatus(a._id, nextStatus(a.status))}
                        disabled={
                          a.status === "completed" ||
                          a.status === "cancelled" ||
                          processingId === a._id
                        }
                        className={cn(
                          "rounded-xl border px-4 py-2 text-xs font-semibold transition-all shadow-sm w-full text-center block",
                          a.status === "completed" || a.status === "cancelled"
                            ? "border-slate-800 bg-slate-800/20 text-slate-500 cursor-not-allowed hidden"
                            : processingId === a._id
                              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300 cursor-wait"
                              : "border-slate-700 bg-emerald-400/10 text-emerald-300 hover:bg-emerald-400 hover:text-slate-900 border-emerald-400",
                        )}
                      >
                        {processingId === a._id
                          ? "..."
                          : a.status === "pending"
                            ? "Mark Confirmed"
                            : a.status === "confirmed"
                              ? "Mark Completed"
                              : "Finished"}
                      </button>

                      {a.status === "completed" && (
                        <button
                          onClick={() => {
                            setRxAppt(a);
                            setMedicines([
                              {
                                name: "",
                                dosage: "",
                                frequency: "",
                                duration: "",
                                route: "",
                                instructions: "",
                              },
                            ]);
                            setRxNotes("");
                          }}
                          className="rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-4 py-2 text-xs font-semibold text-indigo-300 hover:bg-indigo-400 hover:text-indigo-950 transition-colors shadow-[0_0_10px_rgba(99,102,241,0.1)] w-full text-center mt-2 block"
                        >
                          + Add Prescription
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 ? (
                <tr>
                  <td
                    className="px-4 py-8 text-center text-slate-400"
                    colSpan={4}
                  >
                    No appointments found for this filter.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </Card>

      {/* RX WRITER OVERLAY */}
      {rxAppt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-800/60 bg-slate-900/50 flex justify-between items-center shrink-0">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Clinical Prescription
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Prescribing for: {rxAppt.patient?.name}
                </p>
              </div>
              <button
                onClick={() => setRxAppt(null)}
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

            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
              <form id="rx-form" onSubmit={handleSaveRx}>
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-2 mt-4">
                    <h3 className="text-sm font-semibold text-indigo-300">
                      Medications (Max 20)
                    </h3>
                    <button
                      type="button"
                      onClick={() => {
                        if (medicines.length < 20) {
                          setMedicines([
                            ...medicines,
                            {
                              name: "",
                              dosage: "",
                              frequency: "",
                              duration: "",
                              route: "",
                              instructions: "",
                            },
                          ]);
                        } else {
                          setToast("Maximum 20 medicines allowed.");
                        }
                      }}
                      className="text-[11px] uppercase tracking-wider font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg transition-colors border border-slate-700 hover:border-slate-500"
                    >
                      + Add Med
                    </button>
                  </div>

                  {medicines.map((med, i) => (
                    <div
                      key={i}
                      className="flex flex-col gap-3 bg-slate-950/40 p-4 rounded-2xl border border-slate-800/60 relative"
                    >
                      {medicines.length > 1 && (
                        <button
                          type="button"
                          onClick={() =>
                            setMedicines(
                              medicines.filter((_, idx) => idx !== i),
                            )
                          }
                          className="absolute top-3 right-3 p-1.5 bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white rounded-lg transition-colors"
                        >
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
                              d="M6 18L18 6M6 6l12 12"
                            ></path>
                          </svg>
                        </button>
                      )}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pr-6">
                        <div>
                          <label className="text-[10px] uppercase font-semibold text-slate-500 mb-1 block">
                            Medicine Name
                          </label>
                          <input
                            type="text"
                            value={med.name}
                            onChange={(e) =>
                              updateMedicine(i, "name", e.target.value)
                            }
                            className="w-full rounded-xl border border-slate-700 bg-slate-900/40 px-3 py-2 text-sm text-white outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400/40"
                            placeholder="Ibuprofen 400mg"
                            required
                          />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase font-semibold text-slate-500 mb-1 block">
                            Dosage
                          </label>
                          <input
                            type="text"
                            value={med.dosage}
                            onChange={(e) =>
                              updateMedicine(i, "dosage", e.target.value)
                            }
                            className="w-full rounded-xl border border-slate-700 bg-slate-900/40 px-3 py-2 text-sm text-white outline-none focus:border-indigo-400"
                            placeholder="1 Pill"
                            required
                          />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase font-semibold text-slate-500 mb-1 block">
                            Frequency
                          </label>
                          <input
                            type="text"
                            value={med.frequency}
                            onChange={(e) =>
                              updateMedicine(i, "frequency", e.target.value)
                            }
                            className="w-full rounded-xl border border-slate-700 bg-slate-900/40 px-3 py-2 text-sm text-white outline-none focus:border-indigo-400"
                            placeholder="Twice a daily"
                            required
                          />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase font-semibold text-slate-500 mb-1 block">
                            Duration
                          </label>
                          <input
                            type="text"
                            value={med.duration}
                            onChange={(e) =>
                              updateMedicine(i, "duration", e.target.value)
                            }
                            className="w-full rounded-xl border border-slate-700 bg-slate-900/40 px-3 py-2 text-sm text-white outline-none focus:border-indigo-400"
                            placeholder="5 Days"
                            required
                          />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase font-semibold text-slate-500 mb-1 block">
                            Route
                          </label>
                          <input
                            type="text"
                            value={med.route}
                            onChange={(e) =>
                              updateMedicine(i, "route", e.target.value)
                            }
                            className="w-full rounded-xl border border-slate-700 bg-slate-900/40 px-3 py-2 text-sm text-white outline-none focus:border-indigo-400"
                            placeholder="Oral"
                            required
                          />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase font-semibold text-slate-500 mb-1 block">
                            Specific Inst.
                          </label>
                          <input
                            type="text"
                            value={med.instructions}
                            onChange={(e) =>
                              updateMedicine(i, "instructions", e.target.value)
                            }
                            className="w-full rounded-xl border border-slate-700 bg-slate-900/40 px-3 py-2 text-sm text-white outline-none focus:border-indigo-400"
                            placeholder="Take after food"
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="pt-4">
                    <h3 className="text-sm font-semibold text-indigo-300 mb-2">
                      Clinical Notes & Advice
                    </h3>
                    <textarea
                      value={rxNotes}
                      onChange={(e) => setRxNotes(e.target.value)}
                      className="w-full rounded-xl border border-slate-700 bg-slate-900/40 px-3 py-2 text-sm text-white outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400/40 h-28 resize-none"
                      placeholder="Take medicines after meals. Avoid cold water."
                    ></textarea>
                  </div>
                </div>
              </form>
            </div>

            <div className="p-6 border-t border-slate-800 bg-slate-950 shadow-inner flex shrink-0 justify-end gap-3 rounded-b-3xl">
              <button
                onClick={() => setRxAppt(null)}
                className="px-5 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-sm font-semibold hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="rx-form"
                disabled={savingRx}
                className="px-6 py-2.5 rounded-xl bg-indigo-500 text-white text-sm font-semibold hover:bg-indigo-400 transition-colors shadow-[0_0_20px_rgba(99,102,241,0.3)] disabled:opacity-50 inline-flex items-center gap-2"
              >
                {savingRx ? "Processing..." : "Finalize Prescription"}
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
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
