import React, { useState, useRef, useEffect } from "react";
import { Bell, CheckCircle, Clock } from "lucide-react";
import { useNotifications } from "../context/NotificationContext";

export default function NotificationDropdown() {
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative inline-flex items-center justify-center rounded-xl p-2 text-slate-300 hover:bg-slate-800/70 hover:text-white transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-slate-900">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-slate-700/60 bg-slate-900/95 backdrop-blur-xl shadow-2xl z-50 overflow-hidden transform origin-top-right transition-all">
          <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3 bg-slate-800/30">
            <h3 className="text-sm font-semibold text-white">Notifications</h3>
            {unreadCount > 0 && (
              <span className="text-xs font-medium text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">
                {unreadCount} new
              </span>
            )}
          </div>
          <div className="max-h-[360px] overflow-y-auto custom-scrollbar">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-slate-400">
                You have no notifications.
              </div>
            ) : (
              <div className="divide-y divide-slate-800/60">
                {notifications.map((notif) => (
                  <div
                    key={notif._id}
                    className={`flex items-start gap-3 p-4 transition-colors ${
                      notif.isRead ? "bg-transparent opacity-75" : "bg-slate-800/20"
                    }`}
                  >
                    <div className="mt-1 flex-shrink-0">
                      {notif.isRead ? (
                        <CheckCircle className="w-4 h-4 text-slate-500" />
                      ) : (
                        <span className="flex h-2 w-2 rounded-full bg-emerald-500 mt-1"></span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm leading-snug ${
                          notif.isRead ? "text-slate-300" : "text-slate-100 font-medium"
                        }`}
                      >
                        {notif.message}
                      </p>
                      <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-slate-400">
                        <Clock className="w-3 h-3" />
                        {new Date(notif.createdAt).toLocaleString(undefined, {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                    {!notif.isRead && (
                      <button
                        onClick={() => markAsRead(notif._id)}
                        className="text-xs font-medium text-emerald-400 hover:text-emerald-300 p-1"
                      >
                        Mark read
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
