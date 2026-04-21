import React, { useState, useMemo } from "react";
import { cn } from "../../utils/helpers";
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

function SectionTitle({ title, subtitle }) {
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
    </div>
  );
}

export const AvailabilityView = ({ doctor, refreshData, setToast }) => {
  const commonSlots = [
    "09:00 AM",
    "09:30 AM",
    "10:00 AM",
    "10:30 AM",
    "11:00 AM",
    "04:00 PM",
    "04:30 PM",
    "05:00 PM",
  ];

  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1); // defaulting to tomorrow
    return d.toISOString().slice(0, 10);
  });
  const [newSlot, setNewSlot] = useState(commonSlots[0]);
  const [isUpdating, setIsUpdating] = useState(false);

  const activeSchedule = useMemo(() => {
    if (!doctor || !doctor.schedule) return {};
    return doctor.schedule;
  }, [doctor]);

  const slots = activeSchedule[selectedDate] || [];

  const updateScheduleState = async (updatedScheduleHash) => {
    if (!doctor || !doctor._id) return;
    setIsUpdating(true);
    try {
      const res = await fetchWithAuth(`/doctors/${doctor._id}/schedule`, {
        method: "PATCH",
        body: JSON.stringify({ schedule: updatedScheduleHash }),
      });
      if (res.success) {
        setToast("Schedule synchronized with the server!");
        refreshData();
      } else {
        setToast(res.message || "Failed to sync schedule.");
      }
    } catch (err) {
      setToast(err.message || "Something went wrong.");
    } finally {
      setIsUpdating(false);
    }
  };

  const onAddSlot = () => {
    if (!newSlot) return;
    const currentArray = [...slots];
    if (currentArray.includes(newSlot)) {
      setToast("Slot already exists for this date.");
      return;
    }

    currentArray.push(newSlot);
    const updated = {
      ...activeSchedule,
      [selectedDate]: currentArray,
    };
    updateScheduleState(updated);
  };

  const onRemoveSlot = (slot) => {
    const currentArray = slots.filter((s) => s !== slot);
    const updated = {
      ...activeSchedule,
      [selectedDate]: currentArray,
    };
    if (currentArray.length === 0) {
      delete updated[selectedDate];
    }
    updateScheduleState(updated);
  };

  const onToggleAvailability = async () => {
    if (!doctor || !doctor._id) return;
    const nextAvail =
      doctor.availability === "Available" ? "Unavailable" : "Available";
    try {
      const res = await fetchWithAuth(`/doctors/${doctor._id}/availability`, {
        method: "PATCH",
        body: JSON.stringify({ availability: nextAvail }),
      });
      if (res.success) {
        setToast(`Visibility marked as ${nextAvail}.`);
        refreshData();
      } else {
        setToast(res.message || "Failed to update availability.");
      }
    } catch (err) {
      setToast(err.message || "Something went wrong.");
    }
  };

  return (
    <div className="space-y-6 max-h-[90vh] overflow-y-auto pr-2 pb-20 custom-scrollbar">
      <SectionTitle
        title="Availability Settings"
        subtitle="Manage slots and your global presence."
      />

      <div className="flex gap-4 p-4 rounded-xl border border-slate-700 bg-slate-900/50 justify-between items-center">
        <div>
          <div className="text-sm font-semibold text-white">
            Global Visibility
          </div>
          <div className="text-xs text-slate-400 mt-0.5">
            Pause all bookings if you are away.
          </div>
        </div>
        <button
          onClick={onToggleAvailability}
          className={cn(
            "rounded-full px-4 py-2 text-xs font-bold transition-colors",
            doctor.availability === "Available"
              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20"
              : "bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20",
          )}
        >
          {doctor.availability === "Available" ? "Mark Away" : "Mark Available"}
        </button>
      </div>

      <Card className="p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-xs font-semibold text-slate-300">
              Target Date
            </label>
            <input
              type="date"
              value={selectedDate}
              min={new Date().toISOString().slice(0, 10)}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900/40 px-3 py-2.5 text-sm text-white outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/40"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-300">
              Add Slot to Selected Date
            </label>
            <div className="mt-1 flex gap-2">
              <select
                value={newSlot}
                onChange={(e) => setNewSlot(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-900/40 px-3 py-2.5 text-sm text-white outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/40"
              >
                {commonSlots.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <button
                type="button"
                disabled={isUpdating}
                onClick={onAddSlot}
                className="rounded-xl bg-emerald-400 text-slate-950 px-5 py-2.5 text-sm font-semibold hover:bg-emerald-300 transition-colors disabled:opacity-50"
              >
                {isUpdating ? "..." : "Add"}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 border-t border-slate-800 pt-5">
          <div className="text-sm font-semibold text-white">
            Active Slots for{" "}
            {new Date(selectedDate).toLocaleDateString(undefined, {
              weekday: "long",
              month: "short",
              day: "numeric",
            })}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {slots.length === 0 ? (
              <div className="text-sm border border-dashed border-slate-700 bg-slate-900/30 text-slate-500 px-4 py-3 rounded-xl w-full text-center font-medium">
                No slots initialized. You are invisible on this day!
              </div>
            ) : (
              slots.map((slot) => (
                <button
                  type="button"
                  key={slot}
                  disabled={isUpdating}
                  onClick={() => onRemoveSlot(slot)}
                  className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-2.5 text-xs font-semibold text-emerald-300 hover:bg-rose-500/20 hover:text-rose-300 hover:border-rose-500/20 transition-all flex items-center gap-2 group"
                  title="Remove slot"
                >
                  {slot}{" "}
                  <span className="opacity-40 group-hover:opacity-100 text-[10px] mt-[1px]">
                    ✕
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};
