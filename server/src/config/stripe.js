import Stripe from "stripe";
import { env } from "./env.js";
import { createHttpError } from "../utils/httpError.js";

export const getStripeClient = () => {
  if (!env.stripeSecretKey) {
    throw createHttpError(
      500,
      "Stripe is not configured. Missing STRIPE_SECRET_KEY.",
    );
  }

  return new Stripe(env.stripeSecretKey, {
    apiVersion: "2024-06-20",
  });
};
