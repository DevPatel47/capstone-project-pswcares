import {
  createAppointmentBooking,
  listAppointmentsForUser,
  rescheduleAppointment,
  updateAppointmentStatus,
} from "../services/appointment.service.js";

export const createBooking = async (req, res, next) => {
  try {
    const appointment = await createAppointmentBooking({
      clientUser: req.user,
      payload: req.body,
    });

    res.status(201).json({
      message: "Appointment created successfully.",
      appointment,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyAppointments = async (req, res, next) => {
  try {
    const appointments = await listAppointmentsForUser({ actor: req.user });

    res.status(200).json({
      count: appointments.length,
      items: appointments,
    });
  } catch (error) {
    next(error);
  }
};

export const updateBookingStatus = async (req, res, next) => {
  try {
    const appointment = await updateAppointmentStatus({
      appointmentId: req.params.appointmentId,
      status: req.body.status,
      actor: req.user,
    });

    res.status(200).json({
      message: "Appointment status updated.",
      appointment,
    });
  } catch (error) {
    next(error);
  }
};

export const rescheduleBooking = async (req, res, next) => {
  try {
    const appointment = await rescheduleAppointment({
      appointmentId: req.params.appointmentId,
      actor: req.user,
      payload: req.body,
    });

    res.status(200).json({
      message: "Appointment rescheduled successfully.",
      appointment,
    });
  } catch (error) {
    next(error);
  }
};
