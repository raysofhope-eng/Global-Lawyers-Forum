export const refundAmount = (feeCents: number) => Math.round(feeCents * 0.75);
export const formatAmount = (amount: number, currency: string) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount / 100);
