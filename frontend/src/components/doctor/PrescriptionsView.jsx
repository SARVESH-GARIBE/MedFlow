import React, { useState } from "react";
import { cn, statusPill } from "../../utils/helpers";
import { fetchWithAuth } from "../../services/api";
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

export const PrescriptionsView = ({ prescriptions = [], setToast }) => {
  const [filter, setFilter] = useState("all");
  const [viewingRx, setViewingRx] = useState(null);
  const [editingRx, setEditingRx] = useState(null);
  const [editMedicines, setEditMedicines] = useState([]);
  const [editNotes, setEditNotes] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  const filtered = prescriptions
    .filter((p) => {
      if (filter === "recent") {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        return new Date(p.createdAt) >= thirtyDaysAgo;
      }
      return true;
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const downloadPDF = (rx) => {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(22);
    doc.setTextColor(59, 130, 246);
    doc.text("MedFlow Digital Prescription", 14, 22);

    // Details
    doc.setFontSize(11);
    doc.setTextColor(20, 20, 20);
    doc.text(
      `Doctor: Dr. ${rx.doctor?.name || rx.doctorSnapshot?.name || "Clinician"}`,
      14,
      34,
    );
    doc.text(`Patient: ${rx.patient?.name || "Patient"}`, 14, 40);
    doc.text(
      `Date Issued: ${new Date(rx.createdAt).toLocaleDateString()}`,
      14,
      46,
    );
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(`Version: ${rx.version || 1}`, 14, 52);

    // Medicines Table
    doc.autoTable({
      startY: 60,
      head: [
        [
          "Medicine Name",
          "Dosage",
          "Frequency",
          "Route",
          "Duration",
          "Instructions",
        ],
      ],
      body: rx.medicines.map((m) => [
        m.name,
        m.dosage,
        m.frequency,
        m.route,
        m.duration,
        m.instructions || "-",
      ]),
      theme: "grid",
      headStyles: { fillColor: [99, 102, 241] },
      margin: { left: 14, right: 14 },
    });

    const finalY = doc.lastAutoTable.finalY || 60;

    // Clinical Notes
    if (rx.notes) {
      doc.text("Clinical Notes / Instructions:", 14, finalY + 15);
      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);
      const splitNotes = doc.splitTextToSize(rx.notes, 180);
      doc.text(splitNotes, 14, finalY + 22);
    }

    // Footer
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Official MedFlow Digital Record | Version: v${rx.version || 1}`,
      14,
      285,
    );

    doc.save(`Prescription_${rx._id.slice(-6)}.pdf`);
  };

  const handleEditPrescription = async (e) => {
    e.preventDefault();
    setSavingEdit(true);

    const validMeds = editMedicines.filter((m) => m.name.trim() !== "");
    if (validMeds.length === 0) {
      setToast("Add at least one medicine before saving.");
      setSavingEdit(false);
      return;
    }

    try {
      const res = await fetchWithAuth(`/prescriptions/${editingRx._id}`, {
        method: "PATCH",
        body: JSON.stringify({
          medicines: validMeds,
          notes: editNotes,
        }),
      });

      if (res.success) {
        setToast("Prescription updated successfully!");
        setEditingRx(null);
      } else {
        setToast(res.message || "Failed to update prescription.");
      }
    } catch (err) {
      setToast("Network error updating prescription.");
    } finally {
      setSavingEdit(false);
    }
  };

  const updateEditMedicine = (idx, field, val) => {
    const newMeds = [...editMedicines];
    newMeds[idx][field] = val;
    setEditMedicines(newMeds);
  };

  return (
    <div className="space-y-6 max-h-[90vh] overflow-y-auto pr-2 pb-20 custom-scrollbar">
      <SectionTitle
        title="Digital Prescriptions"
        subtitle="View and manage prescriptions you've created."
        right={
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50"
          >
            <option value="all">All Prescriptions</option>
            <option value="recent">Last 30 Days</option>
          </select>
        }
      />

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-950/40 text-slate-300">
              <tr className="text-left">
                <th className="px-4 py-3 font-semibold">Patient</th>
                <th className="px-4 py-3 font-semibold">Date Issued</th>
                <th className="px-4 py-3 font-semibold">Medicines</th>
                <th className="px-4 py-3 font-semibold">Version</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filtered.map((rx) => (
                <tr
                  key={rx._id}
                  className="text-slate-200 hover:bg-slate-800/40 transition-colors"
                >
                  <td className="px-4 py-4">
                    <div className="font-semibold text-white">
                      {rx.patient?.name || "Patient"}
                    </div>
                    <div className="mt-0.5 text-xs text-slate-400">
                      {rx.patient?.email || "—"}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-slate-300">
                    {new Date(rx.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-4 text-slate-300">
                    <span className="inline-block px-2.5 py-1 bg-indigo-500/10 text-indigo-300 rounded-lg text-xs font-semibold">
                      {rx.medicines?.length || 0} items
                    </span>
                  </td>
                  <td className="px-4 py-4 text-slate-300">
                    <span className="text-xs font-semibold text-slate-400">
                      v{rx.version || 1}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => setViewingRx(rx)}
                        className="px-3 py-1.5 text-xs font-semibold text-indigo-300 bg-indigo-500/10 border border-indigo-500/30 rounded-lg hover:bg-indigo-500/20 transition-colors"
                      >
                        View
                      </button>
                      <button
                        onClick={() => {
                          setEditingRx(rx);
                          setEditMedicines(rx.medicines || []);
                          setEditNotes(rx.notes || "");
                        }}
                        className="px-3 py-1.5 text-xs font-semibold text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded-lg hover:bg-amber-500/20 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => downloadPDF(rx)}
                        className="px-3 py-1.5 text-xs font-semibold text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 rounded-lg hover:bg-emerald-500/20 transition-colors"
                      >
                        PDF
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 ? (
                <tr>
                  <td
                    className="px-4 py-8 text-center text-slate-400"
                    colSpan={5}
                  >
                    No prescriptions found.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </Card>

      {/* VIEW PRESCRIPTION MODAL */}
      {viewingRx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-800/60 bg-slate-900/50 flex justify-between items-center shrink-0">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  View Prescription
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Patient: {viewingRx.patient?.name}
                </p>
              </div>
              <button
                onClick={() => setViewingRx(null)}
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

            <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
              <div className="space-y-6">
                <div className="bg-indigo-500/5 border border-indigo-500/10 p-4 rounded-2xl">
                  <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-2">
                    Prescription Info
                  </p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-slate-400">Issued</p>
                      <p className="text-white font-semibold">
                        {new Date(viewingRx.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400">Version</p>
                      <p className="text-white font-semibold">
                        v{viewingRx.version || 1}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-slate-300 mb-3 uppercase tracking-wider">
                    Medicines
                  </h3>
                  <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950/30">
                    <table className="min-w-full text-sm text-left">
                      <thead className="bg-slate-900/80 text-slate-400">
                        <tr>
                          <th className="px-4 py-3 font-semibold">Medicine</th>
                          <th className="px-4 py-3 font-semibold">Dosage</th>
                          <th className="px-4 py-3 font-semibold">Frequency</th>
                          <th className="px-4 py-3 font-semibold">Duration</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {viewingRx.medicines?.map((m, i) => (
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
                            <td className="px-4 py-3 text-slate-400">
                              {m.frequency}
                            </td>
                            <td className="px-4 py-3 text-slate-400">
                              {m.duration}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {viewingRx.notes && (
                  <div>
                    <h3 className="text-sm font-semibold text-slate-300 mb-2 uppercase tracking-wider">
                      Clinical Notes
                    </h3>
                    <p className="text-sm text-slate-400 leading-relaxed bg-slate-900/40 p-4 rounded-xl border border-slate-800/60 whitespace-pre-wrap">
                      {viewingRx.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 border-t border-slate-800 bg-slate-950 shadow-inner flex justify-end gap-3 shrink-0 rounded-b-3xl">
              <button
                onClick={() => setViewingRx(null)}
                className="px-5 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-sm font-semibold text-white hover:bg-slate-700 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => downloadPDF(viewingRx)}
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
            </div>
          </div>
        </div>
      )}

      {/* EDIT PRESCRIPTION MODAL */}
      {editingRx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-800/60 bg-slate-900/50 flex justify-between items-center shrink-0">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Edit Prescription
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Patient: {editingRx.patient?.name}
                </p>
              </div>
              <button
                onClick={() => setEditingRx(null)}
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
              <form id="edit-rx-form" onSubmit={handleEditPrescription}>
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-indigo-300">
                      Medications
                    </h3>
                    <button
                      type="button"
                      onClick={() => {
                        if (editMedicines.length < 20) {
                          setEditMedicines([
                            ...editMedicines,
                            {
                              name: "",
                              dosage: "",
                              frequency: "",
                              duration: "",
                              route: "",
                              instructions: "",
                            },
                          ]);
                        }
                      }}
                      className="text-[11px] uppercase tracking-wider font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg transition-colors border border-slate-700 hover:border-slate-500"
                    >
                      + Add Med
                    </button>
                  </div>

                  {editMedicines.map((med, i) => (
                    <div
                      key={i}
                      className="flex flex-col gap-3 bg-slate-950/40 p-4 rounded-2xl border border-slate-800/60 relative"
                    >
                      {editMedicines.length > 1 && (
                        <button
                          type="button"
                          onClick={() =>
                            setEditMedicines(
                              editMedicines.filter((_, idx) => idx !== i),
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
                              updateEditMedicine(i, "name", e.target.value)
                            }
                            className="w-full rounded-xl border border-slate-700 bg-slate-900/40 px-3 py-2 text-sm text-white outline-none focus:border-indigo-400"
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
                              updateEditMedicine(i, "dosage", e.target.value)
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
                              updateEditMedicine(i, "frequency", e.target.value)
                            }
                            className="w-full rounded-xl border border-slate-700 bg-slate-900/40 px-3 py-2 text-sm text-white outline-none focus:border-indigo-400"
                            placeholder="Twice daily"
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
                              updateEditMedicine(i, "duration", e.target.value)
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
                              updateEditMedicine(i, "route", e.target.value)
                            }
                            className="w-full rounded-xl border border-slate-700 bg-slate-900/40 px-3 py-2 text-sm text-white outline-none focus:border-indigo-400"
                            placeholder="Oral"
                            required
                          />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase font-semibold text-slate-500 mb-1 block">
                            Special Instructions
                          </label>
                          <input
                            type="text"
                            value={med.instructions}
                            onChange={(e) =>
                              updateEditMedicine(
                                i,
                                "instructions",
                                e.target.value,
                              )
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
                      Clinical Notes
                    </h3>
                    <textarea
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                      className="w-full rounded-xl border border-slate-700 bg-slate-900/40 px-3 py-2 text-sm text-white outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400/40 h-28 resize-none"
                      placeholder="Clinical notes and instructions..."
                    ></textarea>
                  </div>
                </div>
              </form>
            </div>

            <div className="p-6 border-t border-slate-800 bg-slate-950 shadow-inner flex shrink-0 justify-end gap-3 rounded-b-3xl">
              <button
                onClick={() => setEditingRx(null)}
                className="px-5 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-sm font-semibold text-white hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="edit-rx-form"
                disabled={savingEdit}
                className="px-6 py-2.5 rounded-xl bg-indigo-500 text-white text-sm font-semibold hover:bg-indigo-400 transition-colors shadow-[0_0_20px_rgba(99,102,241,0.3)] disabled:opacity-50 inline-flex items-center gap-2"
              >
                {savingEdit ? "Saving..." : "Save Changes"}
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
