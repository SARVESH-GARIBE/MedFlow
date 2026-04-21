import React, { useState } from "react";
import { formatDateTime, paymentPill, cn } from "../../utils/helpers";
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

function SectionTitle({ title, subtitle, right }) {
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

export const PaymentsView = ({
  appointments,
  payments,
  refreshData,
  setToast,
}) => {
  const [payingAppointmentId, setPayingAppointmentId] = useState("");

  const pending = appointments.filter(
    (a) => a.paymentStatus !== "paid" && a.status !== "cancelled",
  );
  const paid = appointments.filter((a) => a.paymentStatus === "paid");

  // Determine last payment info strictly from the payments payload from db
  const paidRecords = (payments || [])
    .filter((p) => p.status === "paid")
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const lastPayment = paidRecords[0] || null;

  const onPayNow = async (targetAppointment = null) => {
    const target = targetAppointment || pending[0];
    if (!target) {
      setToast("No pending payments.");
      return;
    }

    if (payingAppointmentId) return;

    setPayingAppointmentId(target._id);
    setToast("💳 Creating payment order...");
    try {
      // Step 1: Create order
      const orderData = await fetchWithAuth("/payments/create-order", {
        method: "POST",
        body: JSON.stringify({ appointmentId: target._id }),
      });

      if (!orderData?.success) {
        throw new Error(orderData.message || "Failed to create payment order");
      }

      const orderId = orderData.order_id || orderData.orderId;
      const amountInRupees =
        orderData.amountInRupees ||
        (orderData.amount ? orderData.amount / 100 : 0);

      if (!amountInRupees || amountInRupees <= 0) {
        throw new Error("Invalid payment amount");
      }

      setToast(`💰 Processing ₹${amountInRupees}...`);

      // Step 2: Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 1200));

      setToast("🔄 Verifying payment...");

      // Step 3: Verify payment
      const verifyData = await fetchWithAuth("/payments/verify", {
        method: "POST",
        body: JSON.stringify({
          orderId,
          appointmentId: target._id,
        }),
      });

      if (verifyData?.success) {
        setToast("✅ Payment successful! Appointment confirmed.");
        await refreshData();
      } else {
        setToast("❌ Payment verification failed. Please try again.");
      }
    } catch (err) {
      console.error("Payment error:", err);
      setToast(`❌ ${err.message || "Payment failed. Please try again."}`);
    } finally {
      setPayingAppointmentId("");
    }
  };

  return (
    <div className="space-y-6 max-h-[90vh] overflow-y-auto pr-2 pb-20 custom-scrollbar">
      <SectionTitle
        title="Payments"
        subtitle="Securely complete active invoices."
        right={
          <button
            type="button"
            onClick={() => onPayNow()}
            disabled={pending.length === 0 || payingAppointmentId}
            className={cn(
              "rounded-lg px-4 py-2 font-semibold transition-all",
              pending.length === 0 || payingAppointmentId
                ? "cursor-not-allowed bg-slate-700 text-slate-400"
                : "bg-emerald-600 text-white hover:bg-emerald-700",
            )}
          >
            {payingAppointmentId ? "Processing..." : "Pay Now"}
          </button>
        }
      />

      {paid.length > 0 && (
        <Card className="p-5 sm:p-7">
          <h2 className="mb-4 text-lg font-semibold text-white">
            Payment History
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Stat
              label="Total Paid"
              value={`₹${paid.reduce((sum, a) => sum + (a.doctor?.fee || 0), 0)}`}
              hint={`${paid.length} appointment${paid.length !== 1 ? "s" : ""}`}
            />
            {lastPayment && (
              <>
                <Stat
                  label="Last Payment"
                  value={`₹${lastPayment.amount || 0}`}
                  hint={formatDateTime(lastPayment.createdAt)}
                />
                <Stat
                  label="Status"
                  value="✅ PAID"
                  hint="Transaction confirmed"
                />
              </>
            )}
          </div>
        </Card>
      )}

      {pending.length > 0 && (
        <Card className="p-5 sm:p-7">
          <h2 className="mb-4 text-lg font-semibold text-white">
            Pending Payments ({pending.length})
          </h2>
          <div className="space-y-3">
            {pending.map((appt) => (
              <div
                key={appt._id}
                className="flex flex-col gap-3 rounded-lg border border-slate-700 bg-slate-900/30 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex-1">
                  <p className="font-semibold text-white">
                    Dr. {appt.doctor?.name}
                  </p>
                  <p className="text-sm text-slate-400">
                    {appt.department} • {formatDateTime(appt.appointmentDate)}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Time: {appt.timeSlot}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-3 sm:items-end">
                  <div className="text-right">
                    <p className="text-2xl font-bold text-emerald-400">
                      ₹{appt.doctor?.fee || 0}
                    </p>
                    <p className={`text-xs ${paymentPill(appt.paymentStatus)}`}>
                      {appt.paymentStatus}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onPayNow(appt)}
                    disabled={payingAppointmentId === appt._id}
                    className={cn(
                      "rounded-lg px-4 py-2 font-semibold transition-all whitespace-nowrap",
                      payingAppointmentId === appt._id
                        ? "cursor-not-allowed bg-slate-700 text-slate-400"
                        : "bg-emerald-600 text-white hover:bg-emerald-700",
                    )}
                  >
                    {payingAppointmentId === appt._id ? "Processing..." : "Pay"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {pending.length === 0 && paid.length === 0 && (
        <Card className="p-8 text-center">
          <p className="text-slate-400">No appointments to pay for.</p>
        </Card>
      )}
    </div>
  );
};
