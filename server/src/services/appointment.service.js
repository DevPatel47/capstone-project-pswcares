import Appointment, {
  APPOINTMENT_STATUSES,
} from "../models/appointment.model.js";
import Payment from "../models/payment.model.js";
import PSWProfile from "../models/pswProfile.model.js";
import User from "../models/user.model.js";
import { createHttpError } from "../utils/httpError.js";

const DAY_NAMES = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

const toMinutes = (value) => {
  const [hours, minutes] = String(value).split(":").map(Number);
  return hours * 60 + minutes;
};

const parseDateOnly = (value) => {
  const match = String(value || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const parsed = new Date(year, month - 1, day);

  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day
  ) {
    return null;
  }

  parsed.setHours(0, 0, 0, 0);
  return parsed;
};

const isWithinAvailability = ({
  availability,
  appointmentDate,
  appointmentTime,
  durationMinutes,
}) => {
  if (!Array.isArray(availability) || availability.length === 0) {
    return false;
  }

  const dayName = DAY_NAMES[new Date(appointmentDate).getDay()];
  const appointmentStart = toMinutes(appointmentTime);
  const appointmentEnd = appointmentStart + Number(durationMinutes);

  return availability.some((slot) => {
    if (slot.dayOfWeek !== dayName) {
      return false;
    }

    const slotStart = toMinutes(slot.startTime);
    const slotEnd = toMinutes(slot.endTime);

    return appointmentStart >= slotStart && appointmentEnd <= slotEnd;
  });
};

const findOverlappingAppointment = async ({
  pswId,
  appointmentDate,
  appointmentTime,
  durationMinutes,
  excludeAppointmentId,
}) => {
  const sameDayAppointments = await Appointment.find({
    pswId,
    appointmentDate,
    status: { $in: ["pending", "confirmed"] },
    ...(excludeAppointmentId ? { _id: { $ne: excludeAppointmentId } } : {}),
  }).select("appointmentTime durationMinutes");

  const start = toMinutes(appointmentTime);
  const end = start + Number(durationMinutes);

  return sameDayAppointments.find((item) => {
    const itemStart = toMinutes(item.appointmentTime);
    const itemEnd = itemStart + Number(item.durationMinutes || 0);
    return start < itemEnd && end > itemStart;
  });
};

const validateDateTimeDuration = ({ date, time, duration }) => {
  const parsedDate = parseDateOnly(date);

  if (!parsedDate) {
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

  const canBookInAvailability = isWithinAvailability({
    availability: approvedProfile.availability,
    appointmentDate: schedule.appointmentDate,
    appointmentTime: schedule.appointmentTime,
    durationMinutes: schedule.durationMinutes,
  });

  if (!canBookInAvailability) {
    throw createHttpError(
      400,
      "This PSW is not available for the selected date/time.",
    );
  }

  const overlapping = await findOverlappingAppointment({
    pswId,
    appointmentDate: schedule.appointmentDate,
    appointmentTime: schedule.appointmentTime,
    durationMinutes: schedule.durationMinutes,
  });

  if (overlapping) {
    throw createHttpError(
      409,
      "This time slot is no longer available. Please choose another time.",
    );
  }

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
    .populate("paymentId", "amount currency status paidAt")
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

  if (status === "cancelled" && ["client", "psw"].includes(actor.role)) {
    const paid = await Payment.findOne({
      appointmentId: appointment._id,
      status: "succeeded",
    }).select("_id");

    if (paid) {
      throw createHttpError(
        400,
        "Paid appointments cannot be cancelled. Please reschedule instead.",
      );
    }
  }

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

  const approvedProfile = await PSWProfile.findOne({
    userId: appointment.pswId,
    verificationStatus: "approved",
  });

  if (!approvedProfile) {
    throw createHttpError(400, "Booking is allowed only for verified PSWs.");
  }

  const canBookInAvailability = isWithinAvailability({
    availability: approvedProfile.availability,
    appointmentDate: schedule.appointmentDate,
    appointmentTime: schedule.appointmentTime,
    durationMinutes: schedule.durationMinutes,
  });

  if (!canBookInAvailability) {
    throw createHttpError(
      400,
      "This PSW is not available for the selected date/time.",
    );
  }

  const overlapping = await findOverlappingAppointment({
    pswId: appointment.pswId,
    appointmentDate: schedule.appointmentDate,
    appointmentTime: schedule.appointmentTime,
    durationMinutes: schedule.durationMinutes,
    excludeAppointmentId: appointment._id,
  });

  if (overlapping) {
    throw createHttpError(
      409,
      "This time slot is no longer available. Please choose another time.",
    );
  }

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
