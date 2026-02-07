import { loadStripe } from "@stripe/stripe-js";

export const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "pk_live_51SnPUhLXUoWoiE4TnMl4F5nX7vb1jLjYNqBvcJCJ9OGmq7KpMIBtaMDdGqheu1GU0hKgccdVb2R77zrxIzF3gvwt00TNCSsQ4s");
