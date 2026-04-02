import Appointment from "../models/appointment.model.js";
import Message from "../models/message.model.js";
import { createHttpError } from "../utils/httpError.js";

const isParticipant = ({ appointment, userId }) => {
  const value = String(userId);
  return (
    String(appointment.clientId) === value ||
    String(appointment.pswId) === value
  );
};

export const createChatMessage = async ({
  appointmentId,
  senderId,
  content,
}) => {
  if (!appointmentId) {
    throw createHttpError(400, "appointmentId is required.");
  }

  const safeContent = String(content || "").trim();

  if (!safeContent) {
    throw createHttpError(400, "content is required.");
  }

  const appointment = await Appointment.findById(appointmentId);

  if (!appointment) {
    throw createHttpError(404, "Appointment not found.");
  }

  if (!isParticipant({ appointment, userId: senderId })) {
    throw createHttpError(
      403,
      "You are not a participant in this appointment.",
    );
  }

  if (appointment.status !== "confirmed") {
    throw createHttpError(
      403,
      "Chat is only available for confirmed appointments.",
    );
  }

  const sender = String(senderId);
  const receiverId =
    String(appointment.clientId) === sender
      ? appointment.pswId
      : appointment.clientId;

  const message = await Message.create({
    appointmentId: appointment._id,
    senderId,
    receiverId,
    content: safeContent,
  });

  return {
    message,
    receiverId: String(receiverId),
  };
};

export const getChatMessages = async ({ appointmentId, actor }) => {
  if (!appointmentId) {
    throw createHttpError(400, "appointmentId is required.");
  }

  const appointment = await Appointment.findById(appointmentId);

  if (!appointment) {
    throw createHttpError(404, "Appointment not found.");
  }

  if (
    actor.role !== "admin" &&
    !isParticipant({ appointment, userId: actor._id })
  ) {
    throw createHttpError(
      403,
      "You are not a participant in this appointment.",
    );
  }

  if (!["confirmed", "completed"].includes(appointment.status)) {
    throw createHttpError(
      403,
      "Chat history is only available for confirmed or completed appointments.",
    );
  }

  const messages = await Message.find({ appointmentId: appointment._id })
    .sort({ createdAt: 1 })
    .limit(500);

  return {
    appointment,
    messages,
  };
};
