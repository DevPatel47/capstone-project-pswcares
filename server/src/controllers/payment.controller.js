import {
  createPaymentSession,
  handlePaymentCancel,
  handlePaymentSuccess,
} from "../services/payment.service.js";

export const createCheckoutSession = async (req, res, next) => {
  try {
    const result = await createPaymentSession({
      appointmentId: req.body.appointmentId,
      clientUser: req.user,
    });

    res.status(201).json({
      message: "Stripe checkout session created.",
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

export const paymentSuccess = async (req, res, next) => {
  try {
    const payment = await handlePaymentSuccess({
      sessionId: req.query.session_id,
    });

    res.status(200).json({
      message: "Payment success processed.",
      payment,
    });
  } catch (error) {
    next(error);
  }
};

export const paymentCancel = async (req, res, next) => {
  try {
    const payment = await handlePaymentCancel({
      sessionId: req.query.session_id,
    });

    res.status(200).json({
      message: "Payment cancellation processed.",
      payment,
    });
  } catch (error) {
    next(error);
  }
};
