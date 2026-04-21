export function cn(...parts) {
  return parts.filter(Boolean).join(" ");
}

export function formatDateTime(isoOrDateString) {
  const d = new Date(isoOrDateString);
  if (Number.isNaN(d.getTime())) return String(isoOrDateString || "");
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function statusPill(status) {
  const s = String(status || "pending").toLowerCase();
  const map = {
    pending: "bg-amber-500/10 text-amber-200 ring-1 ring-amber-500/25",
    confirmed: "bg-sky-500/10 text-sky-200 ring-1 ring-sky-500/25",
    completed: "bg-emerald-500/10 text-emerald-200 ring-1 ring-emerald-500/25",
    cancelled: "bg-rose-500/10 text-rose-200 ring-1 ring-rose-500/25",
  };
  return map[s] || map.pending;
}

export function paymentPill(status) {
  const s = String(status || "pending").toLowerCase();
  const map = {
    paid: "bg-emerald-500/10 text-emerald-200 ring-1 ring-emerald-500/25",
    pending: "bg-amber-500/10 text-amber-200 ring-1 ring-amber-500/25",
    created: "bg-amber-500/10 text-amber-200 ring-1 ring-amber-500/25",
    failed: "bg-rose-500/10 text-rose-200 ring-1 ring-rose-500/25",
  };
  return map[s] || map.pending;
}

export function getRazorpayKey() {
  return import.meta.env?.VITE_RAZORPAY_KEY_ID || "";
}

export function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}
