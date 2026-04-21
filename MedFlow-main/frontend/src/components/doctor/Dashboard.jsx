import React from "react";
import { cn, statusPill } from "../../utils/helpers";

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

export const Dashboard = ({ doctor, appointments, todayEarnings }) => {
  const total = appointments.length;
  const today = appointments.filter((a) => isToday(a.appointmentDate)).length;
  const upcoming = appointments.filter((a) => isUpcoming(a.appointmentDate)).length;
  const completed = appointments.filter((a) => a.status === "completed").length;

  const nextUp = appointments
    .filter((a) => a.status !== "completed" && isUpcoming(a.appointmentDate))
    .slice()
    .sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate))[0];

  return (
    <div className="space-y-6 max-h-[90vh] overflow-y-auto pr-2 pb-20 custom-scrollbar">
      <SectionTitle
        title={`Good day, ${doctor.name || "Doctor"}`}
        subtitle={`Workflow overview • ${doctor.specialization || "General"}`}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Total appointments" value={total} hint="All linked cases" />
        <Stat label="Today's appointments" value={today} hint="Scheduled today" />
        <Stat label="Upcoming appointments" value={upcoming} hint="Future visits" />
        <Stat label="Earnings today" value={`₹${todayEarnings || 0}`} hint="Paid consultations" />
      </div>

      <Card className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-sm font-semibold text-white">Next patient</div>
            <div className="mt-1 text-sm text-slate-400">
              {nextUp ? (
                <>
                  <span className="text-slate-200 font-semibold">{nextUp.patient?.name || "Patient"}</span> •{" "}
                  {nextUp.timeSlot || "—"} •{" "}
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ml-2",
                      statusPill(nextUp.status)
                    )}
                  >
                    {String(nextUp.status || "pending").replaceAll("_", " ").toUpperCase()}
                  </span>{" "}
                </>
              ) : (
                "No remaining appointments today."
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
              Focus
            </div>
            <div className="mt-1 text-xs text-slate-400 max-w-[240px]">
              Keep queue moving: confirm pending visits and close consultations as completed.
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-5">
        <div className="text-sm font-semibold text-white">Completed consultations</div>
        <div className="mt-1 text-xs text-slate-400">
          Total completed by this doctor: {completed}
        </div>
      </Card>
    </div>
  );
};
