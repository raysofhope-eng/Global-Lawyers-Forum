import { loadStripe } from "@stripe/stripe-js";
const mode =
  process.env.NEXT_PUBLIC_STRIPE_MODE ||
  (process.env.NODE_ENV === "production" ? "live" : "test");
const key =
  mode === "live"
    ? process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_LIVE
    : process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_TEST;
if (!["test", "live"].includes(mode))
  throw new Error("NEXT_PUBLIC_STRIPE_MODE must be test or live.");
if (key && !key.startsWith(mode === "live" ? "pk_live_" : "pk_test_"))
  throw new Error("Stripe publishable key does not match the selected mode.");
export const stripePromise = key ? loadStripe(key) : null;
