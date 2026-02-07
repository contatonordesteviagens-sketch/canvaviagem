import { loadStripe } from "@stripe/stripe-js";

// Replace with your actual publishable key or use environment variable
export const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "pk_live_your_key_here");
