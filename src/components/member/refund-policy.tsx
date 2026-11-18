import type { EventBooking } from "@/contracts";
import { formatAmount, refundAmount } from "@/lib/refund-policy";
export function RefundPolicy({
  feeCents,
  currency,
}: {
  feeCents?: number;
  currency?: string;
}) {
  return (
    <p className="workspace-note">
      <strong>Refund policy:</strong> A 25% refund fee is deducted. You receive
      75% of your booking payment.
      {feeCents && currency
        ? ` For this booking, ${formatAmount(refundAmount(feeCents), currency)} will be refunded and ${formatAmount(feeCents - refundAmount(feeCents), currency)} deducted.`
        : ""}
    </p>
  );
}
export function RefundSummary({ booking }: { booking: EventBooking }) {
  if (booking.refundAmountCents == null) return null;
  return (
    <p className="field-hint">
      Refund: {formatAmount(booking.refundAmountCents, booking.currency)} ·
      Refund fee deducted:{" "}
      {formatAmount(booking.refundFeeCents || 0, booking.currency)} · Status:{" "}
      {booking.refundStatus || "recorded"}
    </p>
  );
}
