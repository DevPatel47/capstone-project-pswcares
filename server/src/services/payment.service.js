import Appointment from "../models/appointment.model.js";
import Payment from "../models/payment.model.js";
import PSWProfile from "../models/pswProfile.model.js";
import { env } from "../config/env.js";
import { getStripeClient } from "../config/stripe.js";
import { createHttpError } from "../utils/httpError.js";

const CURRENCY = "cad";

const calculateAmountCents = ({ hourlyRate, durationMinutes }) => {
  const amount = Math.round(
    (Number(hourlyRate) * Number(durationMinutes) * 100) / 60,
  );

  if (!Number.isFinite(amount) || amount <= 0) {
    throw createHttpError(400, "Invalid calculated payment amount.");
  }

  return amount;
};

export const createPaymentSession = async ({ appointmentId, clientUser }) => {
  if (clientUser.role !== "client") {
    throw createHttpError(403, "Only clients can create payment sessions.");
  }

  const appointment = await Appointment.findById(appointmentId);

  if (!appointment) {
    throw createHttpError(404, "Appointment not found.");
  }

  if (String(appointment.clientId) !== String(clientUser._id)) {
    throw createHttpError(403, "You can only pay for your own appointment.");
  }

  if (appointment.status !== "confirmed") {
    throw createHttpError(
      400,
      "Payment is available only for confirmed appointments.",
    );
  }

  const existingSucceeded = await Payment.findOne({
    appointmentId: appointment._id,
    status: "succeeded",
  });

  if (existingSucceeded) {
    throw createHttpError(409, "This appointment is already paid.");
  }

  const pswProfile = await PSWProfile.findOne({
    userId: appointment.pswId,
    verificationStatus: "approved",
  });

  if (!pswProfile) {
    throw createHttpError(
      400,
      "Cannot create payment for unverified PSW profile.",
    );
  }

  const amount = calculateAmountCents({
    hourlyRate: pswProfile.hourlyRate,
    durationMinutes: appointment.durationMinutes,
  });

  const stripe = getStripeClient();

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    success_url: `${env.stripeSuccessUrl}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${env.stripeCancelUrl}?session_id={CHECKOUT_SESSION_ID}`,
    client_reference_id: String(appointment._id),
    metadata: {
      appointmentId: String(appointment._id),
      clientId: String(appointment.clientId),
      pswId: String(appointment.pswId),
    },
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: CURRENCY,
          unit_amount: amount,
          product_data: {
            name: "PSWCares Appointment",
            description: `${appointment.appointmentDate.toISOString().slice(0, 10)} ${appointment.appointmentTime} (${appointment.durationMinutes} minutes)`,
          },
        },
      },
    ],
  });

  const payment = await Payment.create({
    appointmentId: appointment._id,
    clientId: appointment.clientId,
    pswId: appointment.pswId,
    amount,
    currency: CURRENCY,
    status: "pending",
    stripeSessionId: session.id,
    stripePaymentIntentId: "",
  });

  appointment.paymentId = payment._id;
  await appointment.save();

  return {
    payment,
    checkoutUrl: session.url,
    sessionId: session.id,
  };
};

export const handlePaymentSuccess = async ({ sessionId }) => {
  if (!sessionId) {
    throw createHttpError(400, "session_id query parameter is required.");
  }

  const stripe = getStripeClient();
  const session = await stripe.checkout.sessions.retrieve(sessionId);

  const payment = await Payment.findOne({ stripeSessionId: session.id });

  if (!payment) {
    throw createHttpError(404, "Payment record not found for this session.");
  }

  if (session.payment_status === "paid") {
    payment.status = "succeeded";
    payment.paidAt = new Date();
    payment.cancelledAt = null;
    payment.stripePaymentIntentId = String(session.payment_intent || "");
    await payment.save();
  }

  return payment;
};

export const handlePaymentCancel = async ({ sessionId }) => {
  if (!sessionId) {
    throw createHttpError(400, "session_id query parameter is required.");
  }

  const payment = await Payment.findOne({ stripeSessionId: sessionId });

  if (!payment) {
    throw createHttpError(404, "Payment record not found for this session.");
  }

  if (payment.status === "pending") {
    payment.status = "cancelled";
    payment.cancelledAt = new Date();
    await payment.save();
  }

  return payment;
};
