import React, { useMemo } from "react";
import { cn } from "../../utils/helpers";

function Card({ children, className }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-800 bg-slate-800/30 shadow-[0_10px_30px_rgba(0,0,0,0.18)]",
        className
      )}
    >
      {children}
    </div>
  );
}

function SectionTitle({ title, subtitle }) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-white">
          {title}
        </h1>
        {subtitle ? <p className="mt-1 text-sm text-slate-400">{subtitle}</p> : null}
      </div>
    </div>
  );
}

export const PatientsView = ({ appointments }) => {
  const linkedPatients = useMemo(() => {
    const map = {};
    appointments.forEach((a) => {
      const p = a?.patient || {};
      if (!p?._id) return;
      if (!map[p._id]) {
        map[p._id] = { _id: p._id, name: p.name || "Patient", email: p.email || "No email", appointmentCount: 0 };
      }
      map[p._id].appointmentCount += 1;
    });
    return Object.values(map).sort((a, b) => b.appointmentCount - a.appointmentCount);
  }, [appointments]);

  return (
    <div className="space-y-6 max-h-[90vh] overflow-y-auto pr-2 pb-20 custom-scrollbar">
      <SectionTitle
        title="Patients"
        subtitle="Unique patient profiles processed through your queue."
      />

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-950/40 text-slate-300">
              <tr className="text-left">
                <th className="px-4 py-4 font-semibold">Patient</th>
                <th className="px-4 py-4 font-semibold">Email</th>
                <th className="px-4 py-4 font-semibold text-center">Appointments Hosted</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {linkedPatients.length === 0 ? (
                <tr>
                  <td className="px-4 py-8 text-slate-400 text-center" colSpan={3}>
                    No linked patient records discovered.
                  </td>
                </tr>
              ) : (
                linkedPatients.map((p) => (
                  <tr key={p._id} className="text-slate-200 hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-4">
                      <div className="font-semibold text-white">{p.name || "—"}</div>
                    </td>
                    <td className="px-4 py-4 text-slate-400">{p.email || "—"}</td>
                    <td className="px-4 py-4 text-center">
                      <div className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-slate-800/50 text-emerald-400 font-bold ring-1 ring-slate-700/50">
                        {p.appointmentCount}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
