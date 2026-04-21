import React, { useEffect, useState } from "react";
import { getData, updateData } from "../../utils/storage.js";
import { ensureMedflowSeed } from "../../utils/seedMedflow.js";

const AppointmentsOverview = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    setError("");
    try {
      ensureMedflowSeed();
      const all = getData("medflow.appointments", []);
      const sorted = (Array.isArray(all) ? all : []).slice().sort((a, b) => {
        const ta = a?.appointmentDate ? new Date(a.appointmentDate).getTime() : 0;
        const tb = b?.appointmentDate ? new Date(b.appointmentDate).getTime() : 0;
        return tb - ta;
      });
      setRows(sorted);
    } catch (e) {
      setError(e.message || "Failed to load appointments");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const updateStatus = (id, status) => {
    updateData(
      "medflow.appointments",
      (prev) =>
        (Array.isArray(prev) ? prev : []).map((a) =>
          a._id === id ? { ...a, status } : a
        ),
      []
    );
    load();
  };

  const remove = (id) => {
    const ok = window.confirm("Delete this appointment?");
    if (!ok) return;
    updateData(
      "medflow.appointments",
      (prev) => (Array.isArray(prev) ? prev : []).filter((a) => a._id !== id),
      []
    );
    load();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-50">Appointments</h1>
          <p className="text-sm text-slate-400">
            Monitor all appointments and track statuses.
          </p>
        </div>
        <button
          type="button"
          onClick={load}
          className="rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-200 hover:bg-slate-800/70 transition-colors"
        >
          Refresh
        </button>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-950/40 text-slate-300">
              <tr className="text-left">
                <th className="px-4 py-3 font-medium">When</th>
                <th className="px-4 py-3 font-medium">Doctor</th>
                <th className="px-4 py-3 font-medium">Patient</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Payment</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr>
                  <td className="px-4 py-6 text-slate-400" colSpan={6}>
                    Loading...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td className="px-4 py-6 text-rose-200" colSpan={6}>
                    {error}
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-slate-400" colSpan={6}>
                    No appointments found.
                  </td>
                </tr>
              ) : (
                rows.map((a) => (
                  <tr key={a._id} className="text-slate-200">
                    <td className="px-4 py-3 text-slate-300">
                      <div className="font-medium text-slate-50">
                        {a.appointmentDate
                          ? new Date(a.appointmentDate).toLocaleDateString()
                          : "—"}
                      </div>
                      <div className="text-xs text-slate-400">
                        {a.timeSlot || "—"}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-50">
                        {a.doctor?.name || "—"}
                      </div>
                      <div className="text-xs text-slate-400">
                        {a.doctor?.specialization || "—"}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-50">
                        {a.patient?.name || "—"}
                      </div>
                      <div className="text-xs text-slate-400">
                        {a.patient?.email || "—"}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={a.status || "pending"}
                        onChange={(e) => updateStatus(a._id, e.target.value)}
                        className="rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-xs outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                      >
                        <option value="pending">pending</option>
                        <option value="confirmed">confirmed</option>
                        <option value="completed">completed</option>
                        <option value="cancelled">cancelled</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-slate-200">
                        {a.paymentStatus || "pending"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => remove(a._id)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-rose-600/40 bg-rose-950/40 text-rose-200 px-3 py-1.5 text-xs font-semibold hover:bg-rose-950/70 transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AppointmentsOverview;

