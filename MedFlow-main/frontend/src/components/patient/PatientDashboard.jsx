import React from "react";
import { formatDateTime, statusPill, cn } from "../../utils/helpers";

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

function isUpcoming(appointment) {
  const when = new Date(appointment?.appointmentDate);
  if (Number.isNaN(when.getTime())) return false;
  return when.getTime() > Date.now() && appointment?.status !== "cancelled";
}

export const PatientDashboard = ({ patientName, appointments }) => {
  const total = appointments.length;
  const upcoming = appointments.filter(isUpcoming).length;
  const paymentPending = appointments.filter((a) => a.paymentStatus !== "paid").length;

  const nextUpcoming = appointments
    .filter(isUpcoming)
    .slice()
    .sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate))[0];

  return (
    <div className="space-y-6 max-h-[90vh] overflow-y-auto pr-2 pb-20 custom-scrollbar">
      <SectionTitle
        title={`Welcome, ${patientName}`}
        subtitle="Here’s a quick snapshot of your care activities."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Total appointments" value={total} hint="All-time count" />
        <Stat label="Upcoming appointments" value={upcoming} hint="Next 30 days" />
        <Stat label="Payment status" value={paymentPending ? "Action needed" : "Up to date"} hint={`${paymentPending} pending`} />
      </div>

      <Card className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-sm font-semibold text-white">Next appointment</div>
            <div className="mt-1 text-sm text-slate-400">
              {nextUpcoming ? (
                <>
                  {nextUpcoming.doctor?.name} • {formatDateTime(nextUpcoming.appointmentDate)} •{" "}
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
                      statusPill(nextUpcoming.status)
                    )}
                  >
                    {String(nextUpcoming.status || "pending").toUpperCase()}
                  </span>
                </>
              ) : (
                "No upcoming appointments scheduled."
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
              Tip
            </div>
            <div className="mt-1 text-xs text-slate-400 max-w-[220px]">
              Keep your profile up to date to speed up check-ins.
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
