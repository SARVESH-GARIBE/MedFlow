import React, { useEffect, useState } from "react";
import { getData } from "../../utils/storage.js";
import { ensureMedflowSeed } from "../../utils/seedMedflow.js";

const PaymentsDashboard = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [todayByDoctor, setTodayByDoctor] = useState([]);

  const load = () => {
    setLoading(true);
    setError("");
    try {
      ensureMedflowSeed();
      const appointments = getData("medflow.appointments", []);
      const doctors = getData("medflow.doctors", []);
      const feeMap = {};
      (Array.isArray(doctors) ? doctors : []).forEach((d) => {
        if (d?._id) feeMap[d._id] = Number(d.fee || 0);
      });
      const list = (Array.isArray(appointments) ? appointments : [])
        .filter((a) => String(a?.paymentStatus || "").toLowerCase() === "paid")
        .map((a) => ({
          _id: `pay_${a._id}`,
          appointmentId: a._id,
          doctorId: a?.doctor?._id || "",
          doctorName: a?.doctor?.name || "Unknown doctor",
          patientName: a?.patient?.name || "—",
          patient: a?.patient || null,
          appointment: a,
          amount: feeMap[a?.doctor?._id] || 0,
          currency: "INR",
          status: "paid",
          method: "Derived",
          createdAt:
            typeof a?.paidAt === "number"
              ? new Date(a.paidAt).toISOString()
              : a?.createdAt || a?.appointmentDate || new Date().toISOString(),
        }));
      const sorted = list.slice().sort((a, b) => {
        const ta = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
        const tb = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
        return tb - ta;
      });
      setRows(sorted);

      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      const todayPayments = sorted.filter((p) => {
        if (p?.status !== "paid") return false;
        const t = p?.createdAt ? new Date(p.createdAt).getTime() : 0;
        return t >= startOfToday.getTime();
      });

      const agg = {};
      todayPayments.forEach((p) => {
        const key = p.doctorId || p.doctorName || "unknown";
        if (!agg[key]) {
          agg[key] = {
            doctorId: p.doctorId || "",
            doctorName: p.doctorName || "Unknown doctor",
            revenue: 0,
            count: 0,
          };
        }
        agg[key].revenue += typeof p.amount === "number" ? p.amount : 0;
        agg[key].count += 1;
      });
      setTodayByDoctor(
        Object.values(agg).sort((a, b) => (b.revenue || 0) - (a.revenue || 0))
      );
    } catch (e) {
      setError(e.message || "Failed to load payments");
      setRows([]);
      setTodayByDoctor([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-50">Payments</h1>
          <p className="text-sm text-slate-400">
            Payment history derived from paid appointments.
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
        <div className="px-4 py-3 border-b border-slate-800 bg-slate-950/20">
          <div className="font-medium text-slate-50">Today's revenue per doctor</div>
          <div className="text-xs text-slate-400 mt-0.5">
            Aggregated from paid payments created today.
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-950/40 text-slate-300">
              <tr className="text-left">
                <th className="px-4 py-3 font-medium">Doctor</th>
                <th className="px-4 py-3 font-medium">Payments</th>
                <th className="px-4 py-3 font-medium">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr>
                  <td className="px-4 py-6 text-slate-400" colSpan={3}>
                    Loading...
                  </td>
                </tr>
              ) : todayByDoctor.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-slate-400" colSpan={3}>
                    No paid payments recorded today.
                  </td>
                </tr>
              ) : (
                todayByDoctor.map((r) => (
                  <tr key={r.doctorId || r.doctorName} className="text-slate-200">
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-50">{r.doctorName}</div>
                      {r.doctorId ? (
                        <div className="text-xs text-slate-400 font-mono">{r.doctorId}</div>
                      ) : null}
                    </td>
                    <td className="px-4 py-3">{r.count}</td>
                    <td className="px-4 py-3">
                      ₹{r.revenue} <span className="text-xs text-slate-400">INR</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-950/40 text-slate-300">
              <tr className="text-left">
                <th className="px-4 py-3 font-medium">Created</th>
                <th className="px-4 py-3 font-medium">Patient</th>
                <th className="px-4 py-3 font-medium">Appointment</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Source</th>
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
                    No payments found.
                  </td>
                </tr>
              ) : (
                rows.map((p) => (
                  <tr key={p._id} className="text-slate-200">
                    <td className="px-4 py-3 text-slate-300">
                      {p.createdAt ? new Date(p.createdAt).toLocaleString() : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-50">
                        {p.patientName || p.patient?.name || "—"}
                      </div>
                      <div className="text-xs text-slate-400">
                        {p.patient?.email || "—"}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-50">
                        {p.doctorName || p.appointment?.doctor?.name || "—"}
                      </div>
                      <div className="text-xs text-slate-400">
                        {p.appointment?.appointmentDate
                          ? new Date(p.appointment.appointmentDate).toLocaleDateString()
                          : "—"}{" "}
                        {p.appointment?.timeSlot ? `• ${p.appointment.timeSlot}` : ""}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      ₹{typeof p.amount === "number" ? p.amount : 0}{" "}
                      <span className="text-xs text-slate-400">{p.currency || "INR"}</span>
                    </td>
                    <td className="px-4 py-3">{p.status}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-slate-400">{p.method || "Derived"}</span>
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

export default PaymentsDashboard;

