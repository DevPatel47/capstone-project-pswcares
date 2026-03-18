import Appointment, {
  APPOINTMENT_STATUSES,
} from "../models/appointment.model.js";
import PSWProfile from "../models/pswProfile.model.js";
import User from "../models/user.model.js";
import { createHttpError } from "../utils/httpError.js";

const validateDateTimeDuration = ({ date, time, duration }) => {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    throw createHttpError(400, "Invalid appointment date.");
  }

  if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(String(time || ""))) {
    throw createHttpError(400, "appointmentTime must be in HH:mm format.");
  }

  const parsedDuration = Number(duration);

  if (
    !Number.isFinite(parsedDuration) ||
    parsedDuration < 15 ||
    parsedDuration > 720
  ) {
    throw createHttpError(400, "duration must be between 15 and 720 minutes.");
  }

  return {
    appointmentDate: parsedDate,
    appointmentTime: String(time),
    durationMinutes: parsedDuration,
  };
};

const assertOwnershipOrAdmin = ({ appointment, actor }) => {
  if (actor.role === "admin") {
    return;
  }

  const actorId = String(actor._id);

  if (actor.role === "client" && String(appointment.clientId) === actorId) {
    return;
  }

  if (actor.role === "psw" && String(appointment.pswId) === actorId) {
    return;
  }

  throw createHttpError(
    403,
    "You do not have permission for this appointment.",
  );
};

export const createAppointmentBooking = async ({ clientUser, payload }) => {
  if (clientUser.role !== "client") {
    throw createHttpError(403, "Only clients can create bookings.");
  }

  const { pswId, date, time, duration, notes } = payload;

  if (!pswId) {
    throw createHttpError(400, "pswId is required.");
  }

  const pswUser = await User.findById(pswId);

  if (!pswUser || pswUser.role !== "psw") {
    throw createHttpError(404, "PSW user not found.");
  }

  if (pswUser.status !== "active") {
    throw createHttpError(400, "PSW account is not active.");
  }

  const approvedProfile = await PSWProfile.findOne({
    userId: pswId,
    verificationStatus: "approved",
  });

  if (!approvedProfile) {
    throw createHttpError(400, "Booking is allowed only for verified PSWs.");
  }

  const schedule = validateDateTimeDuration({ date, time, duration });

  const appointment = await Appointment.create({
    clientId: clientUser._id,
    pswId,
    ...schedule,
    notes: String(notes || "").trim(),
    status: "pending",
  });

  return appointment;
};

export const listAppointmentsForUser = async ({ actor }) => {
  let query = {};

  if (actor.role === "client") {
    query = { clientId: actor._id };
  } else if (actor.role === "psw") {
    query = { pswId: actor._id };
  }

  const appointments = await Appointment.find(query)
    .populate("clientId", "name email")
    .populate("pswId", "name email")
    .sort({ appointmentDate: 1, appointmentTime: 1 });

  return appointments;
};

export const updateAppointmentStatus = async ({
  appointmentId,
  status,
  actor,
}) => {
  if (!APPOINTMENT_STATUSES.includes(status)) {
    throw createHttpError(
      400,
      `status must be one of: ${APPOINTMENT_STATUSES.join(", ")}.`,
    );
  }

  const appointment = await Appointment.findById(appointmentId);

  if (!appointment) {
    throw createHttpError(404, "Appointment not found.");
  }

  assertOwnershipOrAdmin({ appointment, actor });

  const currentStatus = appointment.status;

  if (currentStatus === status) {
    return appointment;
  }

  if (actor.role === "psw") {
    const allowed =
      (currentStatus === "pending" &&
        ["confirmed", "cancelled"].includes(status)) ||
      (currentStatus === "confirmed" && status === "completed");

    if (!allowed) {
      throw createHttpError(400, "Invalid PSW status transition.");
    }
  }

  if (actor.role === "client") {
    const allowed =
      ["pending", "confirmed"].includes(currentStatus) &&
      status === "cancelled";

    if (!allowed) {
      throw createHttpError(
        400,
        "Clients can only cancel pending or confirmed appointments.",
      );
    }
  }

  appointment.status = status;
  await appointment.save();

  return appointment;
};

export const rescheduleAppointment = async ({
  appointmentId,
  actor,
  payload,
}) => {
  const appointment = await Appointment.findById(appointmentId);

  if (!appointment) {
    throw createHttpError(404, "Appointment not found.");
  }

  assertOwnershipOrAdmin({ appointment, actor });

  if (["completed", "cancelled"].includes(appointment.status)) {
    throw createHttpError(
      400,
      "Completed or cancelled appointments cannot be rescheduled.",
    );
  }

  const { date, time, duration, reason } = payload;
  const schedule = validateDateTimeDuration({ date, time, duration });

  appointment.appointmentDate = schedule.appointmentDate;
  appointment.appointmentTime = schedule.appointmentTime;
  appointment.durationMinutes = schedule.durationMinutes;
  appointment.rescheduleReason = String(reason || "").trim();
  appointment.rescheduledAt = new Date();

  // Rescheduling by non-admin requires reconfirmation by the PSW.
  if (actor.role !== "admin") {
    appointment.status = "pending";
  }

  await appointment.save();

  return appointment;
};
