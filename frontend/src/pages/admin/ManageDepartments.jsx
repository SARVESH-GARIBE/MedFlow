import React, { useEffect, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { getData, updateData } from "../../utils/storage.js";
import { ensureMedflowSeed } from "../../utils/seedMedflow.js";

const emptyForm = { name: "", description: "", isActive: true };

const ManageDepartments = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState("");

  const load = () => {
    setLoading(true);
    setError("");
    try {
      ensureMedflowSeed();
      const all = getData("medflow.departments", []);
      const sorted = (Array.isArray(all) ? all : []).slice().sort((a, b) =>
        String(a?.name || "").localeCompare(String(b?.name || ""))
      );
      setRows(sorted);
    } catch (e) {
      setError(e.message || "Failed to load departments");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    const payload = {
      name: form.name,
      description: form.description,
      isActive: !!form.isActive,
    };

    if (editingId) {
      updateData(
        "medflow.departments",
        (prev) =>
          (Array.isArray(prev) ? prev : []).map((d) =>
            d._id === editingId ? { ...d, ...payload } : d
          ),
        []
      );
    } else {
      const dept = {
        _id: `dep_${Math.floor(1000 + Math.random() * 9000)}`,
        ...payload,
        createdAt: new Date().toISOString(),
      };
      updateData(
        "medflow.departments",
        (prev) => [dept, ...(Array.isArray(prev) ? prev : [])],
        []
      );
    }

    setForm(emptyForm);
    setEditingId("");
    load();
  };

  const startEdit = (d) => {
    setEditingId(d._id);
    setForm({
      name: d.name || "",
      description: d.description || "",
      isActive: d.isActive !== false,
    });
  };

  const remove = async (id) => {
    const ok = window.confirm("Delete this department?");
    if (!ok) return;
    updateData(
      "medflow.departments",
      (prev) => (Array.isArray(prev) ? prev : []).filter((d) => d._id !== id),
      []
    );
    load();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-50">Departments</h1>
          <p className="text-sm text-slate-400">
            Add, edit, and delete departments used in appointments.
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

      <div className="grid gap-4 lg:grid-cols-5">
        <form
          onSubmit={submit}
          className="lg:col-span-2 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-slate-50">
              {editingId ? "Edit department" : "Add department"}
            </div>
            <button
              type="button"
              onClick={() => {
                setForm(emptyForm);
                setEditingId("");
              }}
              className="text-xs text-slate-400 hover:text-slate-200"
            >
              Reset
            </button>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              required
              className="w-full rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              placeholder="e.g. Cardiology"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm((p) => ({ ...p, description: e.target.value }))
              }
              rows={3}
              className="w-full rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              placeholder="Optional"
            />
          </div>

          <label className="inline-flex items-center gap-2 text-sm text-slate-200">
            <input
              type="checkbox"
              checked={!!form.isActive}
              onChange={(e) =>
                setForm((p) => ({ ...p, isActive: e.target.checked }))
              }
            />
            Active
          </label>

          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 w-full rounded-lg bg-gradient-to-r from-sky-500 to-emerald-400 px-3 py-2.5 text-sm font-semibold text-slate-950 hover:from-sky-400 hover:to-emerald-300 transition-colors"
          >
            <Plus className="w-4 h-4" />
            {editingId ? "Save changes" : "Create department"}
          </button>
        </form>

        <div className="lg:col-span-3 rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-950/40 text-slate-300">
                <tr className="text-left">
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Active</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {loading ? (
                  <tr>
                    <td className="px-4 py-6 text-slate-400" colSpan={3}>
                      Loading...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td className="px-4 py-6 text-rose-200" colSpan={3}>
                      {error}
                    </td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td className="px-4 py-6 text-slate-400" colSpan={3}>
                      No departments found.
                    </td>
                  </tr>
                ) : (
                  rows.map((d) => (
                    <tr key={d._id} className="text-slate-200">
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-50">{d.name}</div>
                        {d.description ? (
                          <div className="text-xs text-slate-400 mt-0.5">
                            {d.description}
                          </div>
                        ) : null}
                      </td>
                      <td className="px-4 py-3">
                        {d.isActive ? (
                          <span className="text-emerald-300">Yes</span>
                        ) : (
                          <span className="text-rose-300">No</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => startEdit(d)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900/60 text-slate-200 px-3 py-1.5 text-xs font-semibold hover:bg-slate-800/70 transition-colors"
                          >
                            <Pencil className="w-4 h-4" />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => remove(d._id)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-rose-600/40 bg-rose-950/40 text-rose-200 px-3 py-1.5 text-xs font-semibold hover:bg-rose-950/70 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
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
    </div>
  );
};

export default ManageDepartments;

