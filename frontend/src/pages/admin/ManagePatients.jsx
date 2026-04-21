import React, { useEffect, useState } from "react";
import { Ban, CheckCircle2 } from "lucide-react";
import { getData, updateData } from "../../utils/storage.js";
import { ensureMedflowSeed } from "../../utils/seedMedflow.js";

const ManagePatients = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    setError("");
    try {
      ensureMedflowSeed();
      const all = getData("medflow.patients", []);
      setRows(Array.isArray(all) ? all : []);
    } catch (e) {
      setError(e.message || "Failed to load patients");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const setActive = async (id, isActive) => {
    updateData(
      "medflow.patients",
      (prev) =>
        (Array.isArray(prev) ? prev : []).map((p) =>
          p._id === id ? { ...p, isActive } : p
        ),
      []
    );
    load();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-50">Patients</h1>
          <p className="text-sm text-slate-400">
            View patients and enable/disable accounts.
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
                <th className="px-4 py-3 font-medium">Patient</th>
                <th className="px-4 py-3 font-medium">Phone</th>
                <th className="px-4 py-3 font-medium">Active</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr>
                  <td className="px-4 py-6 text-slate-400" colSpan={4}>
                    Loading...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td className="px-4 py-6 text-rose-200" colSpan={4}>
                    {error}
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-slate-400" colSpan={4}>
                    No patients found.
                  </td>
                </tr>
              ) : (
                rows.map((p) => (
                  <tr key={p._id} className="text-slate-200">
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-50">{p.name}</div>
                      <div className="text-xs text-slate-400">{p.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      {p.phone || <span className="text-slate-500">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      {p.isActive ? (
                        <span className="text-emerald-300">Yes</span>
                      ) : (
                        <span className="text-rose-300">No</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {p.isActive ? (
                          <button
                            type="button"
                            onClick={() => setActive(p._id, false)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-rose-600/40 bg-rose-950/40 text-rose-200 px-3 py-1.5 text-xs font-semibold hover:bg-rose-950/70 transition-colors"
                          >
                            <Ban className="w-4 h-4" />
                            Disable
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setActive(p._id, true)}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-400 text-slate-950 px-3 py-1.5 text-xs font-semibold hover:bg-emerald-300 transition-colors"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            Enable
                          </button>
                        )}
                      </div>
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

export default ManagePatients;

