import React from "react";
import { cn, paymentPill, formatDateTime } from "../../utils/helpers";

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

function SectionTitle({ title, subtitle, right }) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-white">
          {title}
        </h1>
        {subtitle ? <p className="mt-1 text-sm text-slate-400">{subtitle}</p> : null}
      </div>
      {right ? <div className="sm:pb-1">{right}</div> : null}
    </div>
  );
}

function Stat({ label, value, hint }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/30 px-4 py-4">
      <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
        {label}
      </div>
      <div className="mt-2 text-2xl font-semibold text-white">{value}</div>
      {hint ? <div className="mt-1 text-xs text-slate-400">{hint}</div> : null}
    </div>
  );
}

export const EarningsView = ({ payments, totalEarnings, todayEarnings }) => {
  return (
    <div className="space-y-6 max-h-[90vh] overflow-y-auto pr-2 pb-20 custom-scrollbar">
      <SectionTitle
        title="Earnings"
        subtitle="Revenue summary and paid consultation history."
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Stat label="Total earnings" value={`₹${totalEarnings || 0}`} hint="All paid consultations" />
        <Stat label="Today's earnings" value={`₹${todayEarnings || 0}`} hint="Paid today" />
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-950/40 text-slate-300">
              <tr className="text-left">
                <th className="px-4 py-4 font-semibold">Created</th>
                <th className="px-4 py-4 font-semibold">Patient</th>
                <th className="px-4 py-4 font-semibold">Amount</th>
                <th className="px-4 py-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {payments.length === 0 ? (
                <tr>
                  <td className="px-4 py-8 text-center text-slate-400" colSpan={4}>
                    No payments yet.
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p._id} className="text-slate-200 hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-4 text-slate-300">
                      <div className="font-medium text-slate-200">{formatDateTime(p.createdAt)}</div>
                      <div className="mt-0.5 text-xs text-slate-500">
                         {p.appointment?.timeSlot || "—"}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-semibold text-white">{p.patient?.name || "Patient"}</div>
                      <div className="mt-0.5 text-xs text-slate-400">{p.patient?.email || "—"}</div>
                    </td>
                    <td className="px-4 py-4 font-bold text-emerald-300">
                      ₹{typeof p.amount === "number" ? p.amount : 0}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wider",
                          paymentPill(p.status)
                        )}
                      >
                        {p.status || "pending"}
                      </span>
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
